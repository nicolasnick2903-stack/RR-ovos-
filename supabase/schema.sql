-- =====================================================================
-- R&R Ovos Caipiras — schema inicial
-- Rode este arquivo inteiro no SQL Editor do projeto Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- CLIENTES
-- ---------------------------------------------------------------------
create table if not exists public.clientes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  endereco      text not null,
  telefone      text not null,
  data_cadastro date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PEDIDOS  (CLIENTES 1:N PEDIDOS)
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  cliente_id       uuid not null references public.clientes(id) on delete restrict,
  data_pedido      date not null,
  quantidade_ovos  integer not null check (quantidade_ovos > 0),
  valor_unitario   numeric(10,2) not null check (valor_unitario >= 0),
  valor_total      numeric(10,2) not null check (valor_total >= 0),
  forma_pagamento  text not null check (forma_pagamento in ('dinheiro', 'pix', 'cartao')),
  tipo_cartao      text check (tipo_cartao in ('credito', 'debito')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Cartão exige tipo; dinheiro/pix não podem ter tipo.
  constraint tipo_cartao_coerente check (
    (forma_pagamento = 'cartao' and tipo_cartao is not null)
    or (forma_pagamento <> 'cartao' and tipo_cartao is null)
  )
);

create index if not exists pedidos_cliente_idx on public.pedidos (cliente_id);
create index if not exists pedidos_data_idx on public.pedidos (data_pedido);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists clientes_updated on public.clientes;
create trigger clientes_updated before update on public.clientes
  for each row execute function public.set_updated_at();

drop trigger if exists pedidos_updated on public.pedidos;
create trigger pedidos_updated before update on public.pedidos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS — só usuário autenticado acessa (app de administrador único).
-- Pronto pra evoluir depois para escopo por usuário/permissões.
-- ---------------------------------------------------------------------
alter table public.clientes enable row level security;
alter table public.pedidos  enable row level security;

drop policy if exists clientes_auth_all on public.clientes;
create policy clientes_auth_all on public.clientes
  for all to authenticated using (true) with check (true);

drop policy if exists pedidos_auth_all on public.pedidos;
create policy pedidos_auth_all on public.pedidos
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- ESTOQUE
-- Livro de movimentos: entradas somam, saidas subtraem. O saldo é a
-- soma. Cada pedido gera automaticamente uma saida (gatilho abaixo).
-- =====================================================================
create table if not exists public.estoque_movimentos (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('entrada', 'saida')),
  quantidade  integer not null check (quantidade > 0),
  motivo      text,
  pedido_id   uuid references public.pedidos(id) on delete cascade,
  data        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists estoque_mov_data_idx on public.estoque_movimentos (data);
create index if not exists estoque_mov_pedido_idx on public.estoque_movimentos (pedido_id);

alter table public.estoque_movimentos enable row level security;
drop policy if exists estoque_auth_all on public.estoque_movimentos;
create policy estoque_auth_all on public.estoque_movimentos
  for all to authenticated using (true) with check (true);

-- Mantém o estoque em sincronia com os pedidos.
create or replace function public.sync_estoque_pedido()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.estoque_movimentos (tipo, quantidade, motivo, pedido_id, data)
    values ('saida', new.quantidade_ovos, 'Pedido', new.id, new.data_pedido);
    return new;
  elsif (tg_op = 'UPDATE') then
    update public.estoque_movimentos
      set quantidade = new.quantidade_ovos, data = new.data_pedido
      where pedido_id = new.id;
    return new;
  elsif (tg_op = 'DELETE') then
    delete from public.estoque_movimentos where pedido_id = old.id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists pedidos_sync_estoque on public.pedidos;
create trigger pedidos_sync_estoque
  after insert or update or delete on public.pedidos
  for each row execute function public.sync_estoque_pedido();

-- Backfill: cria a saida dos pedidos que já existem.
insert into public.estoque_movimentos (tipo, quantidade, motivo, pedido_id, data)
select 'saida', p.quantidade_ovos, 'Pedido', p.id, p.data_pedido
from public.pedidos p
where not exists (
  select 1 from public.estoque_movimentos m where m.pedido_id = p.id
);

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

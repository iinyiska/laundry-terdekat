# Database Schema for Laundry Terdekat
# Run this in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('customer', 'merchant')),
  address text,
  phone text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Internal policies for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Create Services table
create table if not exists public.services (
  id uuid default uuid_generate_v4() primary key,
  merchant_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  price_per_unit numeric not null,
  unit_type text not null, -- 'kg', 'piece'
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;
create policy "Services are viewable by everyone." on public.services for select using (true);
create policy "Merchants can insert their own services." on public.services for insert with check (auth.uid() = merchant_id);
create policy "Merchants can update their own services." on public.services for update using (auth.uid() = merchant_id);
create policy "Merchants can delete their own services." on public.services for delete using (auth.uid() = merchant_id);

-- Create Orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.profiles(id) not null,
  merchant_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted', 'processing', 'ready', 'completed', 'cancelled')) default 'pending',
  total_price numeric,
  pickup_address text,
  pickup_lat double precision,
  pickup_lng double precision,
  delivery_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Users can view their own orders." on public.orders for select using (auth.uid() = customer_id or auth.uid() = merchant_id);
create policy "Customers can insert orders." on public.orders for insert with check (auth.uid() = customer_id);
create policy "Participants can update orders." on public.orders for update using (auth.uid() = customer_id or auth.uid() = merchant_id);

-- Create Order Items table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  service_id uuid references public.services(id) not null,
  quantity numeric not null,
  price_at_order numeric not null, -- Snapshotted price
  details text -- e.g. "Red shirt"
);

alter table public.order_items enable row level security;
create policy "Order items are viewable by order participants." on public.order_items for select using (
  exists (
    select 1 from public.orders
    where public.orders.id = order_items.order_id
    and (public.orders.customer_id = auth.uid() or public.orders.merchant_id = auth.uid())
  )
);
create policy "Customers can insert order items." on public.order_items for insert with check (
  exists (
    select 1 from public.orders
    where public.orders.id = order_items.order_id
    and public.orders.customer_id = auth.uid()
  )
);

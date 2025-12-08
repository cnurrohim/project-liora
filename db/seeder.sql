SET session_replication_role = replica;
--
-- PostgreSQL database dump
--

\restrict Fq4mBAgKGcJkDxMA4TBAA6o5gcjTrkqfwWGHF7oZve9fZ65ST5j1hyC72IpmjsL

-- Dumped from database version 17.6 (Ubuntu 17.6-1build1)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1build1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: adjustment_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, name, username, email, password, is_active, created_at, updated_at, active_role_id, profile_photo, phone_number, address, deleted_at) VALUES ('c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4', 'Developer', 'dev', 'dev@example.com', '$2b$10$He8FMIrsadtF1CfDxYel..NxiKhYgXbJiHxKf3DloRfN/2Q5HtJfy', true, '2025-10-07 10:30:48.411389', '2025-10-07 10:30:48.411389', '493c6e74-d309-4a85-8de5-862f9dbe82a7', NULL, NULL, NULL, NULL);


--
-- Data for Name: goods_issues; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: goods_issue_items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_locations; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: goods_receipt_items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: issue_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: opname_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: order_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: purchase_receives; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: purchase_receive_items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: receipt_number_counters; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_adjustment_items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_opnames; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: stock_opname_items; Type: TABLE DATA; Schema: inventory; Owner: -
--



--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('224c4a85-ba30-4999-941d-29f51714744e', '8160376e-3a90-487a-83cf-0365644ed207', NULL, 'route', 'Stock per Location', 'RiRoadMapFill', '/pages/inventory/stock-location-report', NULL, 'sliding', 'start', 0, 4, 'Stock per Location', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('a3d39552-d9e6-427f-b9ac-a0b6b34d46bb', '1a7d88ad-519a-4075-aecb-6d3b3966d791', NULL, 'route', 'User Profile', 'RiUser5Fill', '/profile', NULL, 'sliding', 'start', 0, 2, 'user profile', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('d6e1a3b4-06d5-4323-a912-cd170334e4b2', 'f963974e-9b54-4d09-9cff-63762eecb0eb', NULL, 'route', 'Create / Manage PO', 'RiShoppingCartFill', '/pages/inventory/purchase-order', NULL, 'sliding', 'start', 0, 1, 'Create / Manage PO', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('54a63b1d-2866-4e34-b345-7d7759847b60', 'f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, 'route', 'App Settings', 'RiSettings4Fill', '/pages/app-settings', NULL, 'sliding', 'start', 0, 1, 'setting nama aplikasi dan logo', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('de1bfba4-635d-40e3-a525-4b7f4419f13f', 'f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, 'route', 'Manage Roles', 'RiUser2Fill', '/pages/roles', NULL, 'sliding', 'start', 0, 5, 'management user roles', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('48e5f14d-807f-4962-be7a-d70a80cdf124', 'f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, 'route', 'Navigation Menu', 'RiCompass3Fill', '/pages/menu', NULL, 'sliding', 'start', 0, 4, 'management users', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('c1e55d2b-4ecb-4a8a-91b6-8a58f72d7614', '0a6b6741-5262-48dc-a00b-e97bb6b9da3c', NULL, 'route', 'Stock Locations', 'RiDashboardFill', '/pages/inventory/stock-location', NULL, 'sliding', 'start', 0, 1, 'Manage Items Stored Location', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('e3f69c2d-545f-4711-92bb-34e9af02a6f6', 'f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, 'route', 'Manage Users', 'RiUserFollowFill', '/pages/users', NULL, 'sliding', 'start', 0, 3, 'management users', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('96753e62-04d8-4a88-bfe6-e7e851a41a31', 'f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, 'command', 'Logout', 'RiShutDownFill', NULL, 'logout', 'sliding', 'end', 0, 6, 'logout from current user', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('b8b9f6ae-276e-4a9a-8870-b9217f18ec0b', 'f963974e-9b54-4d09-9cff-63762eecb0eb', NULL, 'route', 'PO Receipts (KIOSK)', 'RiShoppingBasket2Fill', '/purchase-order/:id/kiosk', NULL, 'sliding', 'start', 0, 2, 'PO Receipts (KIOSK)', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('8f7523d3-c103-4325-b2de-908b16217db1', '1a7d88ad-519a-4075-aecb-6d3b3966d791', NULL, 'route', 'User Preferences', 'RiUserSettingsFill', '/pages/preferences', NULL, 'sliding', 'start', 0, 1, 'User Preferences', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('b002c9dd-9b08-4a0e-a004-909fb1dcc6ea', 'ecbbbe7f-4fa6-4085-b1ef-6bfa441647c9', NULL, 'route', 'GR Entry', 'RiAnticlockwise2Fill', '/pages/inventory/goods-receipts', NULL, 'sliding', 'start', 0, 3, 'GR Entry', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('2387c449-e261-48c9-a0cc-026caeb9bd5a', '0a6b6741-5262-48dc-a00b-e97bb6b9da3c', NULL, 'route', 'Items', 'RiBox2Fill', '/pages/inventory/item', NULL, 'sliding', 'start', 0, 2, 'Manage Logitics Item', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('de76ea18-ece1-48a8-a9f1-2371c5a21277', '0a6b6741-5262-48dc-a00b-e97bb6b9da3c', NULL, 'route', 'Supplier', 'RiUserCommunityFill', '/pages/inventory/supplier', NULL, 'sliding', 'start', 0, 3, 'Manage Suppliers', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('3410b1bc-a222-4955-b4cc-342138b94483', 'ecbbbe7f-4fa6-4085-b1ef-6bfa441647c9', NULL, 'route', 'GR Form', 'RiFileList3Fill', '/goods-receipts/create', NULL, 'sliding', 'start', 0, 4, 'GR Form', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('2c8166ae-0ce5-4227-8b55-471f227f569d', '3adfe1af-0c8b-4a52-882f-ba3722b787a3', NULL, 'route', 'Goods Issues', 'RiStore3Fill', '/pages/inventory/goods-issues', NULL, 'sliding', 'start', 0, 5, 'Goods Inbound and Outbound', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('d932c843-51bf-4220-a247-27884bf7cc3b', 'e2ec2934-c806-4bd7-9162-5697c5e93a38', NULL, 'group', 'Reports', 'RiBarChartBoxFill', NULL, NULL, 'sliding', 'start', 0, 7, 'Reports', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('ca0b7f07-175b-48a3-8dd4-8ff6b5139400', '8160376e-3a90-487a-83cf-0365644ed207', NULL, 'route', 'Stock Movements', 'RiFileCopy2Fill', '/pages/inventory/stock-movements', NULL, 'sliding', 'start', 0, 1, 'Stock Movements', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('c3b2e81e-c149-4eef-9c14-b67090492d6e', '3adfe1af-0c8b-4a52-882f-ba3722b787a3', NULL, 'route', 'Stock Adjustments', 'RiListSettingsFill', '/pages/inventory/stock-adjustments', NULL, 'sliding', 'start', 0, 6, 'Stock Adjustment', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('0ff78308-3d32-4329-bf89-8d30939cc6af', '3adfe1af-0c8b-4a52-882f-ba3722b787a3', NULL, 'route', 'Stock Opname', 'RiRefreshFill', '/pages/inventory/stock-opnames', NULL, 'sliding', 'start', 0, 7, 'Stock Opname', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('8160376e-3a90-487a-83cf-0365644ed207', 'e2ec2934-c806-4bd7-9162-5697c5e93a38', NULL, 'group', 'Inventory Monitoring', 'RiBarcodeBoxLine', NULL, NULL, 'sliding', 'start', 0, 6, 'Inventory Monitoring', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('e2ec2934-c806-4bd7-9162-5697c5e93a38', NULL, NULL, 'group', 'Monitoring', 'RiTvFill', NULL, NULL, 'sliding', 'start', 0, 4, 'List menu untuk keperluat monitoring inventory', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('1a7d88ad-519a-4075-aecb-6d3b3966d791', NULL, NULL, 'group', 'preferences', 'RiUserSettingsFill', NULL, NULL, 'sliding', 'end', 0, 5, 'user preferences', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('5f9c3aec-69b7-49aa-9f20-380f8d3642b7', 'd932c843-51bf-4220-a247-27884bf7cc3b', NULL, 'route', 'Stock History', 'RiTimeZoneFill', '/pages/inventory/stock-history-report/', NULL, 'sliding', 'start', 0, 3, 'Stock History', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('2d17740b-7a54-4916-a393-f27c9cfbf9ca', '8160376e-3a90-487a-83cf-0365644ed207', NULL, 'route', 'Stock On Hand', 'RiHandCoinFill', '/pages/inventory/stock-on-hand', NULL, 'sliding', 'start', 0, 2, 'Stock On Hand', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('0a6b6741-5262-48dc-a00b-e97bb6b9da3c', NULL, NULL, 'group', 'Master Data', 'RiDatabase2Fill', NULL, NULL, 'sliding', 'start', 0, 1, 'Manage Master Data', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('d32186e2-53e1-498b-a0cb-acb8d81c7ed6', NULL, NULL, 'group', 'Purchasing', 'RiShoppingBag3Fill', NULL, NULL, 'sliding', 'start', 0, 2, 'Purchasing', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('f963974e-9b54-4d09-9cff-63762eecb0eb', 'd32186e2-53e1-498b-a0cb-acb8d81c7ed6', NULL, 'group', 'Purchase Orders', 'RiShoppingCart2Fill', NULL, NULL, 'sliding', 'start', 0, 8, 'Purchase Orders', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('ecbbbe7f-4fa6-4085-b1ef-6bfa441647c9', 'd32186e2-53e1-498b-a0cb-acb8d81c7ed6', NULL, 'group', 'Goods Receipts', 'RiShoppingBasket2Fill', NULL, NULL, 'sliding', 'start', 0, 9, 'Goods Receipts', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('3adfe1af-0c8b-4a52-882f-ba3722b787a3', NULL, NULL, 'group', 'Inventory Operations', 'RiBookShelfFill', NULL, NULL, 'sliding', 'start', 0, 3, 'Inventory Operations', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('00c76254-964c-4c47-942c-7e3e4d8dfa4d', 'f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, 'route', 'Departments', 'RiGroup2Fill', '/pages/departments', NULL, 'sliding', 'start', 0, 2, 'Master Departments', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('f97c7ea5-e2e2-495a-bbe0-ca2a9075b459', NULL, NULL, 'group', 'app setting', 'RiSettings3Fill', NULL, NULL, 'sliding', 'end', 0, 9, 'setting aplikasi', NULL, NULL);
INSERT INTO public.menu_items (id, parent_id, menu_key, type, label, icon, route, command, mode, alignment, "position", ordinal, description, icon_color, deleted_at) VALUES ('5faabccf-4806-456d-879d-77bddffd23fa', 'd932c843-51bf-4220-a247-27884bf7cc3b', NULL, 'route', 'PO Summary', 'RiTimelineView', '/pages/inventory/po-summary', NULL, 'sliding', 'start', 0, 5, 'Purchase Order Summary', NULL, NULL);


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('34d13778-69d1-4f1b-8fab-6b533af8ac42', 'delete', 'hapus department', 'department', 'Bisa menghapus department', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('5a37e6fd-73a0-42b8-9c72-78910fa4fd12', 'update', 'mengubah department', 'department', 'Bisa mengubah department', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('24e364fa-f169-4d4e-aa1f-515ebbc3d937', 'create', 'menambahkan department baru', 'department', 'Bisa menambahkan department baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('810bc639-65bc-41c8-bec5-8e0c5ec9a2c1', 'view', 'buka halaman preferences management', 'preferences', 'Bisa membuka halaman management preferences', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('3f58d759-bb58-4844-bfe9-d77a36c1dbb5', 'delete', 'hapus preferences', 'preferences', 'Bisa menghapus preferences', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('a129920d-7dfb-4376-bf10-4ee3e3de6b5a', 'update', 'mengubah preferences', 'preferences', 'Bisa mengubah preferences', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('66ef1954-bbf5-4c2a-94dd-66e0828bce5f', 'create', 'menambahkan preferences baru', 'preferences', 'Bisa menambahkan preferences baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('a661dbce-2e35-48cc-9059-748cedfd3e8c', 'view', 'buka halaman menu management', 'menu', 'Bisa membuka halaman management menu', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('8e0f1640-3811-4664-b8b0-7ce72f9d66a2', 'delete', 'hapus menu', 'menu', 'Bisa menghapus menu', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('957f872a-ec05-45e7-b344-fdb840eb95e5', 'update', 'mengubah menu', 'menu', 'Bisa mengubah menu', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('0fb947b7-5225-41a4-b619-b8d1a3505ad1', 'create', 'menambahkan menu baru', 'menu', 'Bisa menambahkan menu baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('1e5f56dc-feb6-422d-85bd-6cd7f8761942', 'view', 'buka halaman app setting management', 'app_setting', 'Bisa membuka halaman management app setting', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('d6c30375-e05c-4e59-b68c-6d1b2d41e0a1', 'delete', 'hapus app setting', 'app_setting', 'Bisa menghapus app setting', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('cb1adeb6-1bd9-43a9-8c15-8d6dc5ab3a76', 'update', 'mengubah app setting', 'app_setting', 'Bisa mengubah app setting', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('5350b355-1b37-45b1-ad3e-ad0e25cbc74b', 'create', 'menambahkan app setting baru', 'app_setting', 'Bisa menambahkan app setting baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('d63815df-fe49-4e94-bd32-b04bb642c009', 'view', 'buka halaman form user profile', 'user_profile', 'Bisa membuka halaman user profile', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('9e67720c-97e0-430e-884b-89377a3519eb', 'delete', 'hapus user profile', 'user_profile', 'Bisa menghapus user profile', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('9a706a95-0f22-4e4c-93cd-566567a172b1', 'update', 'mengubah user profile', 'user_profile', 'Bisa mengubah user profile', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('e319dc81-cebc-4351-99fc-8f73f87fbe90', 'view', 'buka halaman form stock location', 'stock_location', 'Bisa membuka halaman stock location', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('50437139-5a51-446e-96bc-6c374bb41a25', 'delete', 'hapus stock location', 'stock_location', 'Bisa menghapus stock location', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('8589d05f-c72b-4c69-9562-3e9470744b13', 'update', 'mengubah stock location', 'stock_location', 'Bisa mengubah stock location', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('ab0a2f70-ecee-430e-932c-7aa5bbd78636', 'create', 'menambahkan stock location baru', 'stock_location', 'Bisa menambahkan stock location baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('e391fcf7-0df9-473e-a11a-fb0c672e5223', 'view', 'buka halaman form item', 'item', 'Bisa membuka halaman item', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('d06f0d95-7820-4cfc-8a6f-967d9b13b088', 'delete', 'hapus item', 'item', 'Bisa menghapus item', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('687f3fbe-a1f4-44de-8e79-1e811d0ee34f', 'update', 'mengubah item', 'item', 'Bisa mengubah item', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('bdb4c201-a8f8-47fb-800f-078eae49648a', 'create', 'menambahkan item baru', 'item', 'Bisa menambahkan item baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('a6d41266-ae96-4120-b3bf-cbd02b7f6b4f', 'view', 'buka halaman form supplier', 'supplier', 'Bisa membuka halaman supplier', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('21eaaf06-e089-4ceb-9852-c53f15fdcc3a', 'delete', 'hapus supplier', 'supplier', 'Bisa menghapus supplier', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('0bd7f55a-79e2-46f9-9e3f-0986f376574d', 'update', 'mengubah supplier', 'supplier', 'Bisa mengubah supplier', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('e8c9679f-0c8a-4aed-a044-0078a694133f', 'create', 'menambahkan supplier baru', 'supplier', 'Bisa menambahkan supplier baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('82250154-6820-4eb1-9f4f-6d2b4b1b42b1', 'view', 'buka halaman form purchase order', 'purchase_order', 'Bisa membuka halaman purchase order', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('cc4a16b0-9a50-446e-af0f-b8ce413fd4dc', 'delete', 'hapus purchase order', 'purchase_order', 'Bisa menghapus purchase order', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('691aa7c8-6b92-4c62-ab37-01e1a0b1618f', 'update', 'mengubah purchase order', 'purchase_order', 'Bisa mengubah purchase order', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('23256f23-90c7-4d0a-91fc-af3b4ed30599', 'create', 'menambahkan purchase order baru', 'purchase_order', 'Bisa menambahkan purchase order baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('0a85c5d1-be0f-4343-b49c-9d862ec90e4a', 'approve', 'approve purchase order', 'purchase_order', 'Bisa approve purchase order baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('abf78059-df84-48eb-8d04-e37c80106500', 'receive', 'receive purchase order items', 'purchase_order', 'Bisa receive purchase order items', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('32b45501-36e2-4338-bb0f-7e60c43a6406', 'cancel', 'cancel purchase order items', 'purchase_order', 'Bisa cancel purchase order items', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('d0ec6eba-0a8f-4f99-b91f-a087c7cd20c5', 'view', 'buka halaman form goods receipts', 'goods_receipts', 'Bisa membuka halaman goods receipts', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('2971d49e-2718-4a4b-9076-272990fab5d4', 'delete', 'hapus goods receipts', 'goods_receipts', 'Bisa menghapus goods receipts', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('9d68bd7e-7a7a-4e43-9e07-d232b2842213', 'update', 'mengubah goods receipts', 'goods_receipts', 'Bisa mengubah goods receipts', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('ab746370-1ef7-4d8e-9826-22e0edc27161', 'create', 'menambahkan goods receipts baru', 'goods_receipts', 'Bisa menambahkan goods receipts baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('7703ad68-1e1b-4ebb-bcb4-5cb0188ecf63', 'approve', 'approve goods receipts', 'goods_receipts', 'Bisa approve goods receipts baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('dd36d8e8-420e-4b49-b8bc-37c188e6ba34', 'receive', 'receive goods receipts', 'goods_receipts', 'Bisa receive goods receipts', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('6b7c91f5-3fb9-449c-9849-ea69c728d851', 'cancel', 'cancel goods receipts', 'goods_receipts', 'Bisa cancel goods receipts', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('3e13d415-1289-45db-b8bd-f43e80dd5502', 'view', 'buka halaman form stock adjustment', 'stock_adjustment', 'Bisa membuka halaman stock adjustment', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('079eff7b-ae7f-46e2-becf-bbbb0d3b6fdf', 'delete', 'hapus stock adjustment', 'stock_adjustment', 'Bisa menghapus stock adjustment', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('b91686e9-4179-4259-8bbb-067e20255c00', 'update', 'mengubah stock adjustment', 'stock_adjustment', 'Bisa mengubah stock adjustment', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('cc680d3f-e9f9-47e5-97f9-906166c4e513', 'approve', 'approve stock adjustment', 'stock_adjustment', 'Bisa approve stock adjustment baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('9ea35b84-37bd-4e9e-a966-f54aff5d910e', 'cancel', 'cancel stock adjustment', 'stock_adjustment', 'Bisa cancel stock adjustment', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('c1812f45-822c-43c1-928e-09de0a44547e', 'view', 'buka halaman form stock opname', 'stock_opname', 'Bisa membuka halaman stock opname', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('d0c585e6-490b-4595-ba1e-2fd97483a368', 'delete', 'hapus stock opname', 'stock_opname', 'Bisa menghapus stock opname', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('20333790-1d21-49c3-b1af-7121c6da971b', 'update', 'mengubah stock opname', 'stock_opname', 'Bisa mengubah stock opname', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('012def0f-7403-4416-ba6e-c191bf4fe4ff', 'create', 'menambahkan stock opname baru', 'stock_opname', 'Bisa menambahkan stock opname baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('dfcbc06f-5235-449a-b564-64564f4f181f', 'approve', 'approve stock opname', 'stock_opname', 'Bisa approve stock opname baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('c829f768-a6c4-4089-b90a-bdd48350d26f', 'review', 'review stock opname', 'stock_opname', 'Bisa review stock opname', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('5721224c-88bc-48c7-9387-e1def9df4aa0', 'all_access', 'Administrator', 'superadmin', 'Bisa akses semua', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('dd63ce0c-de60-4914-90ef-e573e3959b99', 'delete', 'hapus user', 'user', 'Bisa menghapus user', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('21344f03-5daf-4233-bb4b-ac983e3eead2', 'update', 'mengubah user', 'user', 'Bisa mengubah user', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('72aeb7cd-d9ca-4473-9520-5e7dcc5e1808', 'create', 'menambahkan user baru', 'user', 'Bisa menambahkan user baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('6658da8c-5460-4be8-ad7b-f3ebef7194fe', 'view', 'buka halaman role management', 'role', 'Bisa membuka halaman management role', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('3e761f25-84d1-4956-8c97-050b450cd570', 'delete', 'hapus roles', 'role', 'Bisa menghapus role', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('e6ba7dc8-b1d8-4b1f-ac56-5dc939b58934', 'update', 'mengubah roles', 'role', 'Bisa mengubah role', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('64e3359e-db44-40e0-8a1d-8bed9dec9e7d', 'create', 'menambahkan roles baru', 'role', 'Bisa menambahkan roles baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('41e4b577-30ac-44f5-86b2-87e34171c5b0', 'view', 'buka halaman department management', 'department', 'Bisa membuka halaman management department', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('e9405977-f46d-4580-9a91-4f8533f71503', 'all_access', 'DEV/IT', 'dev', 'Bisa akses semua', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('b7777865-d2b5-4a3e-9b3f-c09e951551ab', 'view', 'buka halaman users management', 'user', 'Bisa membuka halaman management users', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('a7146a9e-af21-479c-bac8-44714c8d45d9', 'create', 'menambahkan user profile baru', 'user_profile', 'Bisa menambahkan user profile baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('c73fbabf-eaf4-4f0a-bb0d-544b576e4e1d', 'create', 'menambahkan stock adjustment baru', 'stock_adjustment', 'Bisa menambahkan stock adjustment baru', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('81b194d4-22d0-468e-bb8d-5acbe207d082', 'cancel', 'cancel stock opname', 'stock_opname', 'Bisa cancel stock opname', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('277cfa70-b0a0-4345-ac26-eee0027e324e', 'view', 'buka halaman dashboard management', 'dashboard', 'Bisa membuka halaman management dashboard', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('1b2204b5-d007-48c2-8a34-7e6e35ddac15', 'delete', 'hapus dashboard', 'dashboard', 'Bisa menghapus dashboard', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('99229c94-2593-4229-8b08-a0157296de6e', 'update', 'mengubah dashboard', 'dashboard', 'Bisa mengubah dashboard', NULL);
INSERT INTO public.permissions (id, name, label, domain, description, deleted_at) VALUES ('881ba0b6-f40c-4edd-b9ea-000ba5887bdc', 'create', 'menambahkan dashboard baru', 'dashboard', 'Bisa menambahkan dashboard baru', NULL);


--
-- Data for Name: menu_permissions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles (id, name, description, deleted_at) VALUES ('493c6e74-d309-4a85-8de5-862f9dbe82a7', 'dev', 'Developer role with full access', NULL);


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('493c6e74-d309-4a85-8de5-862f9dbe82a7', 'e9405977-f46d-4580-9a91-4f8533f71503');


--
-- Data for Name: user_dashboard_preferences; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_departments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_layout_preferences; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_pinned_menus; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_roles (user_id, role_id, is_default) VALUES ('c5a0bc35-3cfb-4540-be70-6f6aa3cda0e4', '493c6e74-d309-4a85-8de5-862f9dbe82a7', true);

-- UPSERT: public.app_settings
INSERT INTO public.app_settings (id, app_name, app_logo, updated_at)
VALUES (
  gen_random_uuid(),
  'Inventory Demo',
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;


--
-- PostgreSQL database dump complete
--

\unrestrict Fq4mBAgKGcJkDxMA4TBAA6o5gcjTrkqfwWGHF7oZve9fZ65ST5j1hyC72IpmjsL

SET session_replication_role = DEFAULT;

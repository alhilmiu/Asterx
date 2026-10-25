/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // 1. Template Undangan
  const templates = new Collection({
    type: "base",
    name: "invitation_templates",
    listRule: 'is_active = true || @request.auth.id != ""',
    viewRule: 'is_active = true || @request.auth.id != ""',
    createRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule: '@request.auth.role = "owner"',
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "slug",
        type: "text",
        required: true,
        max: 100,
      },
      {
        name: "category",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["wedding", "birthday", "engagement", "event", "other"],
      },
      {
        name: "thumbnail",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "preview_component",
        type: "text",
        required: true,
        max: 100,
      },
      {
        name: "base_price",
        type: "number",
        required: true,
        min: 0,
      },
      {
        name: "description",
        type: "text",
        max: 2000,
      },
      {
        name: "is_active",
        type: "bool",
      },
      {
        name: "sort_order",
        type: "number",
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_invitation_templates_slug ON invitation_templates (slug)",
    ],
  });
  app.save(templates);

  // 2. Data Undangan
  const invitations = new Collection({
    type: "base",
    name: "invitations",
    listRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    viewRule: '(is_active = true && payment_status = "paid") || @request.auth.id != ""',
    createRule: "",
    updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule: '@request.auth.role = "owner"',
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "slug",
        type: "text",
        required: true,
        max: 120,
      },
      {
        name: "template",
        type: "relation",
        required: true,
        collectionId: templates.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "event_type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["wedding", "birthday", "engagement", "event", "other"],
      },
      {
        name: "event_date",
        type: "date",
        required: true,
      },
      {
        name: "content_data",
        type: "json",
      },
      {
        name: "cover_image",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "music_url",
        type: "text",
        max: 500,
      },
      {
        name: "music_file",
        type: "file",
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/wav"],
      },
      {
        name: "gallery_images",
        type: "file",
        maxSelect: 10,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "payment_status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["unpaid", "paid", "cancelled"],
      },
      {
        name: "is_active",
        type: "bool",
      },
      {
        name: "rsvp_enabled",
        type: "bool",
      },
      {
        name: "view_count",
        type: "number",
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_invitations_slug ON invitations (slug)",
    ],
  });
  app.save(invitations);

  // 3. Data RSVP
  const rsvps = new Collection({
    type: "base",
    name: "invitation_rsvps",
    listRule: 'is_visible = true && invitation.is_active = true && invitation.payment_status = "paid"',
    viewRule: 'is_visible = true && invitation.is_active = true && invitation.payment_status = "paid"',
    createRule: "",
    updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    fields: [
      {
        name: "invitation",
        type: "relation",
        required: true,
        collectionId: invitations.id,
        maxSelect: 1,
        cascadeDelete: true,
      },
      {
        name: "guest_name",
        type: "text",
        required: true,
        max: 120,
      },
      {
        name: "attendance",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["attending", "not_attending", "tentative"],
      },
      {
        name: "guest_count",
        type: "number",
        required: true,
        min: 1,
      },
      {
        name: "wishes_message",
        type: "text",
        max: 2000,
      },
      {
        name: "is_visible",
        type: "bool",
      },
    ],
    indexes: [
      "CREATE INDEX idx_invitation_rsvps_invitation ON invitation_rsvps (invitation)",
    ],
  });
  app.save(rsvps);

  // 4. Pesanan / Pembayaran Undangan
  const orders = new Collection({
    type: "base",
    name: "invitation_orders",
    listRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    viewRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    createRule: "",
    updateRule: '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule: '@request.auth.role = "owner"',
    fields: [
      {
        name: "order_number",
        type: "text",
        required: true,
        max: 60,
      },
      {
        name: "invitation",
        type: "relation",
        required: true,
        collectionId: invitations.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "customer_name",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "customer_phone",
        type: "text",
        required: true,
        max: 30,
      },
      {
        name: "customer_email",
        type: "email",
      },
      {
        name: "amount",
        type: "number",
        required: true,
        min: 0,
      },
      {
        name: "payment_status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["pending", "paid", "cancelled", "refunded"],
      },
      {
        name: "payment_method",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["bank_transfer", "qris", "e_wallet", "manual", "cash"],
      },
      {
        name: "payment_proof",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      },
      {
        name: "paid_at",
        type: "date",
      },
      {
        name: "notes",
        type: "text",
        max: 1000,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_invitation_orders_number ON invitation_orders (order_number)",
    ],
  });
  app.save(orders);

  // Seed 3 Template Siap Pakai
  const initialTemplates = [
    {
      name: "Modern Minimalist",
      slug: "modern-minimalist",
      category: "wedding",
      preview_component: "modern-minimalist",
      base_price: 99000,
      description: "Desain monokrom dan aksen slate modern dengan tipografi kontemporer dan layout proporsional.",
      is_active: true,
      sort_order: 1,
    },
    {
      name: "Rustic Blossom",
      slug: "rustic-floral",
      category: "wedding",
      preview_component: "rustic-floral",
      base_price: 129000,
      description: "Nuansa floral romantis, palet warm earth & terracotta, cocok untuk pernikahan intim & taman.",
      is_active: true,
      sort_order: 2,
    },
    {
      name: "Royal Velvet",
      slug: "royal-velvet",
      category: "wedding",
      preview_component: "royal-velvet",
      base_price: 149000,
      description: "Kemewahan klasik dengan ornamen emas elegan, background deep emerald/navy, dan tipografi mewah.",
      is_active: true,
      sort_order: 3,
    },
  ];

  for (let i = 0; i < initialTemplates.length; i++) {
    const item = initialTemplates[i];
    const record = new Record(templates);
    record.set("name", item.name);
    record.set("slug", item.slug);
    record.set("category", item.category);
    record.set("preview_component", item.preview_component);
    record.set("base_price", item.base_price);
    record.set("description", item.description);
    record.set("is_active", item.is_active);
    record.set("sort_order", item.sort_order);
    app.save(record);
  }
}, (app) => {
  const collections = [
    "invitation_orders",
    "invitation_rsvps",
    "invitations",
    "invitation_templates",
  ];

  for (let i = 0; i < collections.length; i++) {
    try {
      const col = app.findCollectionByNameOrId(collections[i]);
      if (col) {
        app.delete(col);
      }
    } catch (_) {}
  }
});

/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const projects = app.findCollectionByNameOrId("projects");
  const invoices = app.findCollectionByNameOrId("invoices");

  // Koleksi token tracking.
  // Token rahasia disimpan dalam bentuk hash.
  const trackingTokens = new Collection({
    type: "base",
    name: "tracking_tokens",

    fields: [
      {
        name: "invoice",
        type: "relation",
        required: true,
        collectionId: invoices.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "project",
        type: "relation",
        required: true,
        collectionId: projects.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "token_hash",
        type: "text",
        required: true,
        max: 128,
      },
      {
        name: "active",
        type: "bool",
        required: true,
      },
      {
        name: "activated_at",
        type: "date",
        required: false,
      },
    ],

    indexes: [
      "CREATE UNIQUE INDEX idx_tracking_tokens_token_hash ON tracking_tokens (token_hash)",
      "CREATE UNIQUE INDEX idx_tracking_tokens_invoice ON tracking_tokens (invoice)",
    ],
  });

  app.save(trackingTokens);

  // Koleksi riwayat progres proyek yang dapat ditampilkan
  // kepada klien jika visible_to_client bernilai true.
  const projectUpdates = new Collection({
    type: "base",
    name: "project_updates",

    listRule:
      '@request.auth.role = "owner" || @request.auth.role = "manager"',
    viewRule:
      '@request.auth.role = "owner" || @request.auth.role = "manager"',
    createRule:
      '@request.auth.role = "owner" || @request.auth.role = "manager"',
    updateRule:
      '@request.auth.role = "owner" || @request.auth.role = "manager"',
    deleteRule:
      '@request.auth.role = "owner"',

    fields: [
      {
        name: "project",
        type: "relation",
        required: true,
        collectionId: projects.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
      {
        name: "update_date",
        type: "date",
        required: true,
      },
      {
        name: "title",
        type: "text",
        required: true,
        max: 150,
      },
      {
        name: "public_message",
        type: "text",
        required: true,
        max: 3000,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: [
          "planning",
          "in_progress",
          "review",
          "completed",
          "cancelled",
        ],
      },
      {
        name: "visible_to_client",
        type: "bool",
        required: true,
      },
    ],

    indexes: [
      "CREATE INDEX idx_project_updates_project_date ON project_updates (project, update_date)",
    ],
  });

  app.save(projectUpdates);
}, (app) => {
  // Rollback sengaja tidak menghapus koleksi agar data
  // tracking tidak terhapus tanpa sengaja.
});


migrate((app) => {
  const projects = app.findCollectionByNameOrId("projects");
  const vendors = app.findCollectionByNameOrId("vendors");
  const clients = app.findCollectionByNameOrId("clients");

  const projectVendors = new Collection({
    name: "project_vendors",
    type: "base",

    fields: [
      {
        name: "project",
        type: "relation",
        required: true,
        collectionId: projects.id,
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        name: "vendor",
        type: "relation",
        required: true,
        collectionId: vendors.id,
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        name: "work_description",
        type: "text",
        max: 2000,
      },
      {
        name: "cost",
        type: "number",
        min: 0,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["planned", "in_progress", "completed", "cancelled"],
      },
      {
        name: "notes",
        type: "text",
        max: 5000,
      },
    ],

    indexes: [],

    listRule: clients.listRule,
    viewRule: clients.viewRule,
    createRule: clients.createRule,
    updateRule: clients.updateRule,
    deleteRule: clients.deleteRule,
  });

  app.save(projectVendors);
}, (app) => {
  // Tidak menghapus data secara otomatis saat rollback.
});

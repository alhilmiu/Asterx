
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const projects = app.findCollectionByNameOrId("projects");

  const collection = new Collection({
    type: "base",
    name: "operational_expenses",
    fields: [
      new TextField({
        name: "expense_name",
        required: true,
        max: 255,
      }),

      new RelationField({
        name: "project",
        collectionId: projects.id,
        maxSelect: 1,
        cascadeDelete: false,
      }),

      new DateField({
        name: "expense_date",
        required: true,
      }),

      new SelectField({
        name: "category",
        required: true,
        maxSelect: 1,
        values: [
          "transport",
          "internet",
          "software",
          "production",
          "marketing",
          "other",
        ],
      }),

      new NumberField({
        name: "amount",
        required: true,
        min: 0,
      }),

      new TextField({
        name: "notes",
        max: 2000,
      }),
    ],

    // Data keuangan tetap terkunci dari akses publik.
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection =
    app.findCollectionByNameOrId("operational_expenses");

  app.delete(collection);
});

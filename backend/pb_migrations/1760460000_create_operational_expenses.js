/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("operational_expenses");

  const projects = app.findCollectionByNameOrId("projects");

  collection.fields.add(
    new TextField({
      name: "expense_name",
      required: true,
      max: 255,
    }),
    new RelationField({
      name: "project",
      collectionId: projects.id,
      maxSelect: 1,
      required: false,
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
      required: false,
      max: 2000,
    })
  );

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("operational_expenses");

  [
    "expense_name",
    "project",
    "expense_date",
    "category",
    "amount",
    "notes",
  ].forEach((name) => collection.fields.removeByName(name));

  app.save(collection);
});
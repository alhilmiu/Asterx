
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("portfolios");

  collection.fields.add(
    new TextField({
      name: "title",
      required: true,
      max: 200,
    }),
    new TextField({
      name: "slug",
      required: true,
      max: 200,
    }),
    new TextField({
      name: "category",
      required: true,
      max: 100,
    }),
    new TextField({
      name: "description",
      max: 2000,
    }),
    new URLField({
      name: "website_url",
    }),
    new URLField({
      name: "demo_url",
    }),
    new FileField({
      name: "cover_image",
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
    }),
    new NumberField({
      name: "sort_order",
      onlyInt: true,
    }),
    new BoolField({
      name: "is_published",
    })
  );

  collection.indexes.push(
    "CREATE UNIQUE INDEX idx_portfolios_slug ON portfolios (slug)"
  );

  collection.listRule = 'is_published = true';
  collection.viewRule = 'is_published = true';
  collection.createRule = '@request.auth.id != ""';
  collection.updateRule = '@request.auth.id != ""';
  collection.deleteRule = '@request.auth.id != ""';

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("portfolios");

  collection.fields.removeByName("title");
  collection.fields.removeByName("slug");
  collection.fields.removeByName("category");
  collection.fields.removeByName("description");
  collection.fields.removeByName("website_url");
  collection.fields.removeByName("demo_url");
  collection.fields.removeByName("cover_image");
  collection.fields.removeByName("sort_order");
  collection.fields.removeByName("is_published");

  collection.indexes = collection.indexes.filter(
    (index) => !index.includes("idx_portfolios_slug")
  );

  return app.save(collection);
});

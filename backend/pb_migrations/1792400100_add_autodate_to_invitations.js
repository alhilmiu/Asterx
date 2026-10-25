/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collections = [
    "invitation_templates",
    "invitations",
    "invitation_rsvps",
    "invitation_orders",
  ];

  for (let i = 0; i < collections.length; i++) {
    try {
      const col = app.findCollectionByNameOrId(collections[i]);
      if (col) {
        col.fields.add(
          new AutodateField({
            name: "created",
            onCreate: true,
            onUpdate: false,
          }),
          new AutodateField({
            name: "updated",
            onCreate: true,
            onUpdate: true,
          })
        );
        app.save(col);
      }
    } catch (_) {}
  }
}, (app) => {
  const collections = [
    "invitation_templates",
    "invitations",
    "invitation_rsvps",
    "invitation_orders",
  ];

  for (let i = 0; i < collections.length; i++) {
    try {
      const col = app.findCollectionByNameOrId(collections[i]);
      if (col) {
        col.fields.removeByName("created");
        col.fields.removeByName("updated");
        app.save(col);
      }
    } catch (_) {}
  }
});

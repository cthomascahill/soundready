migrate((app) => {
  const collection = new Collection({
    name: "audio_uploads",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "audio",
        type: "file",
        required: true,
        options: {
          maxSelect: 1,
          maxSize: 52428800, // 50MB
          mimeTypes: [
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/aac",
            "audio/mp4",
          ],
        },
      },
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("audio_uploads");
  return app.delete(collection);
});

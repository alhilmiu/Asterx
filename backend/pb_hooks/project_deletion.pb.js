// ============================================
// TRIMI - SAFE PROJECT DELETION
// PocketBase v0.40.5
// ============================================
// POST /api/trimi/projects/delete
// Hanya owner. Transaksi dibatalkan seluruhnya jika pemeriksaan/penghapusan gagal.
// Invoice, pembayaran, project updates, dan tracking tokens tidak dihapus.

routerAdd(
  "POST",
  "/api/trimi/projects/delete",
  (e) => {
    const auth = e.auth;
    if (!auth) {
      throw new UnauthorizedError("Silakan login terlebih dahulu.");
    }

    if (auth.get("role") !== "owner") {
      throw new ForbiddenError("Hanya owner yang dapat menghapus proyek.");
    }

    const body = new DynamicModel({ projectId: "" });
    e.bindBody(body);

    const projectId = (body.projectId || "").trim();
    if (!projectId) {
      throw new BadRequestError("Project ID wajib diisi.");
    }

    let detachedVendorCount = 0;

    try {
      $app.runInTransaction((txApp) => {
        let project;
        try {
          project = txApp.findRecordById("projects", projectId);
        } catch (_) {
          throw new NotFoundError("Proyek tidak ditemukan.");
        }

        // Jangan hapus proyek yang masih memiliki invoice atau riwayat tracking.
        // Karena invoice dipertahankan, seluruh pembayaran yang terkait juga tetap aman.
        const checks = [
          { collection: "invoices", label: "invoice" },
          { collection: "project_updates", label: "riwayat tracking" },
          { collection: "tracking_tokens", label: "token tracking" },
        ];

        const related = [];
        for (let i = 0; i < checks.length; i++) {
          try {
            const records = txApp.findRecordsByFilter(
              checks[i].collection,
              "project = {:project}",
              "",
              1,
              0,
              { project: projectId }
            );
            if (records.length > 0) {
              related.push(checks[i].label);
            }
          } catch (_) {
            // Fail closed: bila pemeriksaan gagal, transaksi dibatalkan.
            throw new BadRequestError(
              "Pemeriksaan relasi " + checks[i].label + " gagal. Proyek tidak dihapus demi keamanan data."
            );
          }
        }

        if (related.length > 0) {
          throw new BadRequestError(
            "Proyek belum bisa dihapus karena masih memiliki " + related.join(", ") + ". " +
            "Data transaksi dan tracking dipertahankan. Arsipkan proyek ini atau selesaikan relasinya terlebih dahulu."
          );
        }

        // Relasi vendor dan proyek berada dalam transaksi yang sama.
        // Jika penghapusan proyek gagal, pelepasan relasi vendor ikut rollback.
        let vendorLinks;
        try {
          vendorLinks = txApp.findRecordsByFilter(
            "project_vendors",
            "project = {:project}",
            "",
            500,
            0,
            { project: projectId }
          );
        } catch (_) {
          throw new BadRequestError(
            "Relasi vendor tidak dapat diperiksa. Proyek tidak dihapus."
          );
        }

        for (let i = 0; i < vendorLinks.length; i++) {
          txApp.delete(vendorLinks[i]);
        }
        detachedVendorCount = vendorLinks.length;

        txApp.delete(project);
      });
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof BadRequestError || err instanceof ForbiddenError) {
        throw err;
      }
      throw new BadRequestError(
        "Penghapusan proyek dibatalkan. Tidak ada perubahan yang disimpan. Periksa relasi koleksi di PocketBase."
      );
    }

    return e.json(200, {
      success: true,
      message: "Proyek berhasil dihapus. " + detachedVendorCount + " relasi vendor dilepas; data vendor tetap tersimpan.",
    });
  },
  $apis.requireAuth()
);

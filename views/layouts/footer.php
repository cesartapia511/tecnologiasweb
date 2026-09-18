</main>

<footer class="bg-white border-top py-3 mt-auto">
  <div class="container text-center text-muted" style="font-size: 0.85rem;">
    <p class="mb-0">
      <strong>Sistema Web de Apoyo Académico para Tutorías</strong> &bull; &copy; <?= date('Y') ?> UPDS - Materia de Tecnologías Web
    </p>
  </div>
</footer>

<!-- Bootstrap 5 Bundle JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
  // Helper para confirmación de eliminación con SweetAlert2
  function confirmarEliminacion(url, mensaje = '¿Estás seguro de eliminar este registro?') {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = url;
      }
    });
  }
</script>
</body>
</html>

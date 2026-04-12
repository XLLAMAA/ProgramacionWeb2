import { EventEmitter } from "events";

// Crear instancia del EventEmitter
const notificationService = new EventEmitter();

// ========================================
// LISTENERS - Escuchan los eventos
// ========================================

// Cuando se registra un usuario
notificationService.on("user:registered", (data) => {
    console.log("📧 EVENTO: Usuario registrado");
    console.log(`   Email: ${data.email}`);
    console.log(`   Codigo verificacion: ${data.verificationCode}`);
    // Aqui podrias: enviar email, guardar en BD, etc
});

// Cuando se verifica el email de un usuario
notificationService.on("user:verified", (data) => {
    console.log("✅ EVENTO: Usuario verificado");
    console.log(`   Email: ${data.email}`);
    console.log(`   User ID: ${data.userId}`);
});

// Cuando se invita a un compañero
notificationService.on("user:invited", (data) => {
    console.log("👥 EVENTO: Usuario invitado");
    console.log(`   Email: ${data.email}`);
    console.log(`   Empresa: ${data.companyId}`);
    console.log(`   Contrasena temporal: ${data.tempPassword}`);
});

// Cuando se elimina un usuario
notificationService.on("user:deleted", (data) => {
    console.log("🗑️  EVENTO: Usuario eliminado");
    console.log(`   User ID: ${data.userId}`);
});

// ========================================
// EXPORT
// ========================================

export default notificationService;

import 'dotenv/config';
import prisma from '../src/prisma/prismaClient.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n==================================================");
  console.log("=== SCRIPT INTERACTIVO DE ACTUALIZACIÓN DE USUARIOS ===");
  console.log("==================================================");
  console.log("Conectando a la base de datos a través de DATABASE_URL...");
  
  try {
    await prisma.$connect();
    console.log("¡Conexión exitosa a la base de datos PostgreSQL!\n");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
    rl.close();
    process.exit(1);
  }

  while (true) {
    console.log("--------------------------------------------------");
    const idInput = await askQuestion("Ingrese el ID del usuario a modificar (o -1 para salir): ");
    const id = parseInt(idInput, 10);
    
    if (id === -1) {
      console.log("\nSaliendo del script. ¡Hasta luego!");
      break;
    }

    if (isNaN(id)) {
      console.log("ID inválido. Por favor ingrese un número entero.");
      continue;
    }

    // Buscar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) {
      console.log(`No se encontró ningún usuario con el ID ${id}. Intente nuevamente.`);
      continue;
    }

    console.log(`\nUsuario encontrado:`);
    console.log(`- Nombre: ${user.name}`);
    console.log(`- Email : ${user.email}`);
    console.log(`- Rol   : ${user.role.name} (ID: ${user.roleId})`);
    console.log(`--------------------------------------------------`);
    console.log("(Deje vacío cualquier campo que NO desee modificar)\n");

    const name = await askQuestion(`Nuevo nombre [Actual: ${user.name}]: `);
    const email = await askQuestion(`Nuevo email [Actual: ${user.email}]: `);
    const password = await askQuestion("Nueva password: ");

    const updateData = {};
    if (name.trim()) updateData.name = name.trim();
    if (email.trim()) updateData.email = email.trim();
    
    if (password.trim()) {
      console.log("Encriptando nueva contraseña...");
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password.trim(), salt);
    }

    if (Object.keys(updateData).length === 0) {
      console.log("\nNo se especificaron cambios. Volviendo al inicio.");
      continue;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });
      console.log(`\n¡Usuario ID ${id} actualizado con éxito!`);
      console.log(`- Nuevo nombre: ${updatedUser.name}`);
      console.log(`- Nuevo email : ${updatedUser.email}`);
    } catch (err) {
      console.error("\nError al actualizar el usuario en la base de datos:", err.message);
    }
  }

  rl.close();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("\nOcurrió un error inesperado:", e);
  rl.close();
  await prisma.$disconnect();
  process.exit(1);
});

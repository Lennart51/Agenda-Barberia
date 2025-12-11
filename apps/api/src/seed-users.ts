import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Iniciando seed de usuarios...');

    // Contraseñas sin hash para comparar
    const users = [
      {
        email: 'admin@barberia.com',
        password: 'admin123',
        nombreCompleto: 'Admin Barbería',
        telefono: '+56912345678',
        rol: 'ADMIN',
      },
      {
        email: 'barbero@barberia.com',
        password: 'barbero123',
        nombreCompleto: 'Juan Barbero',
        telefono: '+56987654321',
        rol: 'BARBERO',
      },
      {
        email: 'cliente@barberia.com',
        password: 'cliente123',
        nombreCompleto: 'María Cliente',
        telefono: '+56911223344',
        rol: 'CLIENTE',
      },
    ];

    for (const user of users) {
      console.log(`📝 Procesando usuario: ${user.email}`);
      
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.usuario.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        // Actualizar contraseña del usuario existente
        await prisma.usuario.update({
          where: { email: user.email },
          data: {
            contrasena: hashedPassword,
            nombreCompleto: user.nombreCompleto,
            telefono: user.telefono,
            rol: user.rol as any,
          },
        });

        // Verificar y crear perfiles específicos si no existen
        if (user.rol === 'CLIENTE') {
          const existingCliente = await prisma.cliente.findUnique({
            where: { usuarioId: existingUser.id }
          });
          if (!existingCliente) {
            await prisma.cliente.create({
              data: {
                usuarioId: existingUser.id,
              }
            });
          }
        } else if (user.rol === 'BARBERO') {
          const existingBarbero = await prisma.barbero.findUnique({
            where: { usuarioId: existingUser.id }
          });
          if (!existingBarbero) {
            await prisma.barbero.create({
              data: {
                usuarioId: existingUser.id,
                nombre: user.nombreCompleto,
                anosExperiencia: 5,
                biografia: 'Barbero profesional con experiencia en cortes modernos y clásicos.',
              }
            });
          }
        }
        
        console.log(`✅ Usuario ${user.email} actualizado`);
      } else {
        // Crear nuevo usuario
        const newUser = await prisma.usuario.create({
          data: {
            email: user.email,
            contrasena: hashedPassword,
            nombreCompleto: user.nombreCompleto,
            telefono: user.telefono,
            rol: user.rol as any,
          },
        });
        
        // Crear perfil específico según el rol
        if (user.rol === 'CLIENTE') {
          await prisma.cliente.create({
            data: {
              usuarioId: newUser.id,
            }
          });
        } else if (user.rol === 'BARBERO') {
          await prisma.barbero.create({
            data: {
              usuarioId: newUser.id,
              nombre: user.nombreCompleto,
              anosExperiencia: 5,
              biografia: 'Barbero profesional con experiencia en cortes modernos y clásicos.',
            }
          });
        }
        
        console.log(`✅ Usuario ${user.email} creado`);
      }
    }

    console.log('🎉 Seed completado exitosamente');
    
    // Verificar login de usuarios
    console.log('\n🔍 Verificando passwords...');
    for (const user of users) {
      const dbUser = await prisma.usuario.findUnique({
        where: { email: user.email },
      });
      
      if (dbUser) {
        const isValid = await bcrypt.compare(user.password, dbUser.contrasena);
        console.log(`${user.email}: ${isValid ? '✅ Password correcto' : '❌ Password incorrecto'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
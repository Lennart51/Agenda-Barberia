import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AgendasService } from './agendas.service';
import { PrismaService } from '../prisma.service';

describe('AgendasService', () => {
  let service: AgendasService;
  let prismaService: PrismaService;

  const mockAgenda = {
    id: 'agenda-id-123',
    title: 'Agenda Test',
    description: 'Descripción de prueba',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    agenda: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AgendasService>(AgendasService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Limpiar mocks
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una agenda exitosamente', async () => {
      const createDto = {
        title: 'Nueva Agenda',
        description: 'Descripción nueva',
        completed: false,
      };

      mockPrismaService.agenda.create.mockResolvedValue({
        ...mockAgenda,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(result).toHaveProperty('description', createDto.description);
      expect(mockPrismaService.agenda.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('debe propagar error de Prisma', async () => {
      mockPrismaService.agenda.create.mockRejectedValue(
        new Error('Error de BD')
      );

      await expect(
        service.create({ title: 'Test' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las agendas ordenadas por fecha', async () => {
      const mockAgendas = [mockAgenda, { ...mockAgenda, id: 'agenda-2' }];
      mockPrismaService.agenda.findMany.mockResolvedValue(mockAgendas);

      const result = await service.findAll();

      expect(result).toEqual(mockAgendas);
      expect(mockPrismaService.agenda.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debe retornar array vacío si no hay agendas', async () => {
      mockPrismaService.agenda.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('debe propagar error de Prisma', async () => {
      mockPrismaService.agenda.findMany.mockRejectedValue(
        new Error('Error de BD')
      );

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('debe retornar una agenda por ID', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(mockAgenda);

      const result = await service.findOne(mockAgenda.id);

      expect(result).toEqual(mockAgenda);
      expect(mockPrismaService.agenda.findUnique).toHaveBeenCalledWith({
        where: { id: mockAgenda.id },
      });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una agenda exitosamente', async () => {
      const updateDto = {
        title: 'Título Actualizado',
        description: 'Descripción actualizada',
      };

      mockPrismaService.agenda.findUnique.mockResolvedValue(mockAgenda);
      mockPrismaService.agenda.update.mockResolvedValue({
        ...mockAgenda,
        ...updateDto,
      });

      const result = await service.update(mockAgenda.id, updateDto);

      expect(result).toHaveProperty('title', updateDto.title);
      expect(result).toHaveProperty('description', updateDto.description);
      expect(mockPrismaService.agenda.update).toHaveBeenCalledWith({
        where: { id: mockAgenda.id },
        data: updateDto,
      });
    });

    it('debe lanzar NotFoundException si la agenda no existe', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { title: 'Nuevo' })
      ).rejects.toThrow(NotFoundException);
    });

    it('debe propagar error de Prisma', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(mockAgenda);
      mockPrismaService.agenda.update.mockRejectedValue(
        new Error('Error de BD')
      );

      await expect(
        service.update(mockAgenda.id, { title: 'Nuevo' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una agenda exitosamente', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(mockAgenda);
      mockPrismaService.agenda.delete.mockResolvedValue(mockAgenda);

      const result = await service.remove(mockAgenda.id);

      expect(result).toEqual(mockAgenda);
      expect(mockPrismaService.agenda.delete).toHaveBeenCalledWith({
        where: { id: mockAgenda.id },
      });
    });

    it('debe lanzar NotFoundException si la agenda no existe', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe propagar error de Prisma', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(mockAgenda);
      mockPrismaService.agenda.delete.mockRejectedValue(
        new Error('Error de BD')
      );

      await expect(service.remove(mockAgenda.id)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('toggleComplete', () => {
    it('debe cambiar el estado de completado', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(mockAgenda);
      mockPrismaService.agenda.update.mockResolvedValue({
        ...mockAgenda,
        completed: !mockAgenda.completed,
      });

      const result = await service.toggleComplete(mockAgenda.id);

      expect(result.completed).toBe(!mockAgenda.completed);
      expect(mockPrismaService.agenda.update).toHaveBeenCalledWith({
        where: { id: mockAgenda.id },
        data: { completed: !mockAgenda.completed },
      });
    });

    it('debe lanzar NotFoundException si la agenda no existe', async () => {
      mockPrismaService.agenda.findUnique.mockResolvedValue(null);

      await expect(service.toggleComplete('id-inexistente')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findCompleted', () => {
    it('debe retornar solo agendas completadas', async () => {
      const completedAgendas = [
        { ...mockAgenda, completed: true },
        { ...mockAgenda, id: 'agenda-2', completed: true },
      ];
      mockPrismaService.agenda.findMany.mockResolvedValue(completedAgendas);

      const result = await service.findCompleted();

      expect(result).toEqual(completedAgendas);
      expect(mockPrismaService.agenda.findMany).toHaveBeenCalledWith({
        where: { completed: true },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('findPending', () => {
    it('debe retornar solo agendas pendientes', async () => {
      const pendingAgendas = [
        mockAgenda,
        { ...mockAgenda, id: 'agenda-2' },
      ];
      mockPrismaService.agenda.findMany.mockResolvedValue(pendingAgendas);

      const result = await service.findPending();

      expect(result).toEqual(pendingAgendas);
      expect(mockPrismaService.agenda.findMany).toHaveBeenCalledWith({
        where: { completed: false },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});

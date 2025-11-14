import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { CreateRuleDto, UpdateRuleDto, SimulateRuleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Lista todas as regras' })
  async findAll(@Query('active') active?: boolean) {
    return this.rulesService.findAll(active);
  }

  @Get(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Busca uma regra por ID' })
  async findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Cria uma nova regra' })
  async create(@Body() createRuleDto: CreateRuleDto) {
    return this.rulesService.create(createRuleDto);
  }

  @Put(':id')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Atualiza uma regra' })
  async update(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto) {
    return this.rulesService.update(id, updateRuleDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativa uma regra' })
  async remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }

  @Post('simulate')
  @Roles('ADMIN', 'DP_RH')
  @ApiOperation({ summary: 'Simula o impacto de uma regra antes de aplicá-la' })
  async simulate(@Body() simulateDto: SimulateRuleDto) {
    return this.rulesService.simulate(simulateDto);
  }
}




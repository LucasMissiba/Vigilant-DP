import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'VIGILANT API - Plataforma de Gestão Proativa de Jornada';
  }
}




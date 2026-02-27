import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from './system-settings.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly settingsRepository: Repository<SystemSettings>,
  ) {}

  async getAll(): Promise<SystemSettings[]> {
    return this.settingsRepository.find({ order: { setting_key: 'ASC' } });
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({
      where: { setting_key: key },
    });
    return setting?.setting_value || null;
  }

  async set(key: string, value: string, description?: string): Promise<SystemSettings> {
    let setting = await this.settingsRepository.findOne({
      where: { setting_key: key },
    });

    if (setting) {
      setting.setting_value = value;
      if (description !== undefined) {
        setting.description = description;
      }
      return this.settingsRepository.save(setting);
    }

    setting = this.settingsRepository.create({
      setting_key: key,
      setting_value: value,
      description: description || null,
    });
    return this.settingsRepository.save(setting);
  }
}

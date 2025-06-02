import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private nzMessageService: NzMessageService) {}

  success(message: string): void {
    this.nzMessageService.success(message);
  }

  error(message: string): void {
    this.nzMessageService.error(message);
  }

  warning(message: string): void {
    this.nzMessageService.warning(message);
  }

  info(message: string): void {
    this.nzMessageService.info(message);
  }
}

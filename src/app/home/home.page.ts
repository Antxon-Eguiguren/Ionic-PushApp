import { ApplicationRef, Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mensajes: OSNotificationPayload[] = [];

  constructor(public pushSrv: PushService, private appRef: ApplicationRef) { }

  ngOnInit() {
    this.pushSrv.pushListener.subscribe(notificacion => {
      this.mensajes.unshift(notificacion);
      this.appRef.tick();
    });
  }

  async ionViewWillEnter() {
    this.mensajes = await this.pushSrv.getMensajes();
  }

  async borrarMensajes() {
    await this.pushSrv.borrarMensajes();
    this.mensajes = [];
  }

}

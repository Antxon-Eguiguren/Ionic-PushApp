import { EventEmitter, Injectable } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  userId: string;
  mensajes: OSNotificationPayload[] = [];
  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cargarMensajesDesdeLS();
  }

  configInicial() {
    this.oneSignal.startInit('becc7803-b48d-4899-b315-aa5452b5ec43', '211365685584');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((notificacion) => {
      console.log('Notificación recibida', notificacion);
      this.notificacionRecibida(notificacion);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (notificacion) => {
      console.log('Notificación abierta', notificacion);
      await this.notificacionRecibida(notificacion.notification);
    });

    // Obtener ID del suscriptor
    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida(notificacion: OSNotification) {
    await this.cargarMensajesDesdeLS();
    const payload = notificacion.payload;
    const existePush = this.mensajes.find(item => item.notificationID === payload.notificationID);

    if (existePush) {
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardarMensajesEnLS();
  }

  guardarMensajesEnLS() {
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajesDesdeLS() {
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async getMensajes() {
    await this.cargarMensajesDesdeLS();
    return [...this.mensajes];
  }

  async borrarMensajes() {
    await this.storage.remove('mensajes');
    this.mensajes = [];
    this.guardarMensajesEnLS();
  }
}

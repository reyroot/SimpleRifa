import { Resend } from 'resend';
import Config from '../models/Config.js';

class EmailService {
  constructor() {
    this.resend = null;
    this._initialized = false;
  }

  // Inicializar Resend de forma lazy para asegurar que dotenv ya se haya ejecutado
  _initializeResend() {
    if (this._initialized) {
      return this.resend;
    }

    this._initialized = true;
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 're_your_api_key_here') {
      console.warn('RESEND_API_KEY no configurada o es un valor por defecto. Los emails no se enviarán.');
      console.warn('Valor actual:', apiKey ? '***' + apiKey.slice(-4) : 'undefined');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
      console.log('✅ EmailService inicializado correctamente con Resend');
    }
    
    return this.resend;
  }

  async getConfig() {
    try {
      return await Config.getConfig();
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return null;
    }
  }

  async sendOrderApprovedEmail(order, tickets) {
    const resend = this._initializeResend();
    if (!resend) {
      console.log('Email service no disponible. Simulando envío de email de pedido aprobado.');
      return;
    }

    try {
      const config = await this.getConfig();
      const platformName = config?.platformName || 'Sistema de Rifas';
      const contactEmail = config?.contactEmail || 'noreply@example.com';
      
      const ticketNumbers = tickets.map(t => t.numberString).join(', ');
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007bff, #28a745); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-numbers { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #007bff; }
            .ticket-number { display: inline-block; background: #e7f3ff; padding: 10px 15px; margin: 5px; border-radius: 5px; font-weight: bold; color: #007bff; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Pedido Aprobado!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${order.buyerInfo.name}</strong>,</p>
              
              <p>¡Excelente noticia! Tu pedido ha sido aprobado y ya tienes tus números asignados para la rifa <strong>${order.raffle.title}</strong>.</p>
              
              <div class="ticket-numbers">
                <h3 style="margin-top: 0; color: #007bff;">Tus Números:</h3>
                <div>
                  ${tickets.map(t => `<span class="ticket-number">${t.numberString}</span>`).join('')}
                </div>
              </div>
              
              <p><strong>Detalles del pedido:</strong></p>
              <ul>
                <li>Cantidad de números: ${order.quantity}</li>
                <li>Total pagado: $${order.totalAmount.toLocaleString()}</li>
                <li>Fecha de aprobación: ${new Date(order.paymentApprovalDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
              </ul>
              
              <p>Puedes consultar tus números en cualquier momento ingresando tu email en la sección "Mis Tickets".</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-tickets" class="button">Ver Mis Tickets</a>
              </div>
              
              ${order.raffle.drawDate ? `<p><strong>Fecha del sorteo:</strong> ${new Date(order.raffle.drawDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
              
              <p>¡Mucha suerte!</p>
              
              <p>Saludos,<br>El equipo de ${platformName}</p>
            </div>
            <div class="footer">
              <p>${config?.footerText || '© 2024 Sistema de Rifas. Todos los derechos reservados.'}</p>
              ${config?.contactEmail ? `<p>Contacto: ${config.contactEmail}</p>` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: `${platformName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: order.buyerInfo.email,
        subject: `🎉 Tu pedido ha sido aprobado - ${order.raffle.title}`,
        html: html
      });

      if (error) {
        console.error('Error enviando email de pedido aprobado:', error);
        throw error;
      }

      console.log('Email de pedido aprobado enviado a:', order.buyerInfo.email);
      return data;
    } catch (error) {
      console.error('Error en sendOrderApprovedEmail:', error);
      throw error;
    }
  }

  async sendWinnerNotificationEmail(raffle, winningTickets) {
    const resend = this._initializeResend();
    if (!resend) {
      console.log('Email service no disponible. Simulando envío de email de ganador.');
      return;
    }

    try {
      const config = await this.getConfig();
      const platformName = config?.platformName || 'Sistema de Rifas';
      
      // Agrupar tickets por email (si hay múltiples ganadores de la misma compra)
      const ticketsByEmail = {};
      winningTickets.forEach(ticket => {
        if (!ticketsByEmail[ticket.ownerEmail]) {
          ticketsByEmail[ticket.ownerEmail] = [];
        }
        ticketsByEmail[ticket.ownerEmail].push(ticket);
      });

      // Enviar email a cada ganador
      const emailPromises = Object.entries(ticketsByEmail).map(async ([email, tickets]) => {
        // Obtener el order del primer ticket (todos los tickets del mismo email tienen el mismo order)
        const ticket = tickets[0];
        let order = ticket.order;
        
        // Si order no está populado, hacerlo
        if (typeof order === 'string' || !order.buyerInfo) {
          const Order = (await import('../models/Order.js')).default;
          order = await Order.findById(ticket.order);
        }
        
        const buyerName = order.buyerInfo.name;
        
        const ticketNumbers = tickets.map(t => t.numberString).join(', ');
        const isMultiple = tickets.length > 1;
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ffc107, #ff9800); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .winner-box { background: linear-gradient(135deg, #fff3cd, #ffe69c); padding: 30px; border-radius: 8px; margin: 20px 0; border: 3px solid #ffc107; text-align: center; }
              .ticket-number { display: inline-block; background: #ffc107; color: #333; padding: 15px 20px; margin: 5px; border-radius: 8px; font-weight: bold; font-size: 18px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="font-size: 36px; margin: 0;">🏆 ¡FELICIDADES! 🏆</h1>
                <p style="font-size: 20px; margin: 10px 0 0 0;">¡ERES GANADOR!</p>
              </div>
              <div class="content">
                <p>Hola <strong>${buyerName}</strong>,</p>
                
                <div class="winner-box">
                  <h2 style="margin-top: 0; color: #856404;">🎉 ¡FELICITACIONES! 🎉</h2>
                  <p style="font-size: 18px; margin: 15px 0;">Tu${isMultiple ? 's' : ''} número${isMultiple ? 's' : ''} <strong>${ticketNumbers}</strong> ${isMultiple ? 'han sido' : 'ha sido'} seleccionado${isMultiple ? 's' : ''} como ganador${isMultiple ? 'es' : ''} en la rifa:</p>
                  <h3 style="color: #856404; margin: 20px 0;">${raffle.title}</h3>
                </div>
                
                <p><strong>Próximos pasos:</strong></p>
                <p>Nos pondremos en contacto contigo pronto para coordinar la entrega de tu premio.</p>
                
                <p><strong>Información de contacto registrada:</strong></p>
                <ul>
                  <li>Email: ${email}</li>
                  <li>Teléfono: ${order.buyerInfo.phone || 'No proporcionado'}</li>
                </ul>
                
                ${config?.contactEmail || config?.contactPhone ? `
                  <p><strong>Para más información, contáctanos:</strong></p>
                  <ul>
                    ${config.contactEmail ? `<li>Email: ${config.contactEmail}</li>` : ''}
                    ${config.contactPhone ? `<li>Teléfono: ${config.contactPhone}</li>` : ''}
                  </ul>
                ` : ''}
                
                <p style="font-size: 18px; font-weight: bold; color: #28a745;">¡Nuevamente, felicidades!</p>
                
                <p>Saludos,<br>El equipo de ${platformName}</p>
              </div>
              <div class="footer">
                <p>${config?.footerText || '© 2024 Sistema de Rifas. Todos los derechos reservados.'}</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const { data, error } = await resend.emails.send({
          from: `${platformName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
          to: email,
          subject: `🏆 ¡FELICIDADES! Eres ganador en ${raffle.title}`,
          html: html
        });

        if (error) {
          console.error(`Error enviando email de ganador a ${email}:`, error);
          throw error;
        }

        console.log('Email de ganador enviado a:', email);
        return data;
      });

      await Promise.all(emailPromises);
      return true;
    } catch (error) {
      console.error('Error en sendWinnerNotificationEmail:', error);
      throw error;
    }
  }

  async sendOTPEmail(email, otp) {
    const resend = this._initializeResend();
    if (!resend) {
      console.log('Email service no disponible. Simulando envío de OTP.');
      return;
    }

    try {
      const config = await this.getConfig();
      const platformName = config?.platformName || 'Sistema de Rifas';
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007bff, #28a745); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px solid #007bff; text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Código de Verificación</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              
              <p>Has solicitado consultar tus tickets. Para continuar, ingresa el siguiente código de verificación:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666;">Tu código de verificación es:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Este código expira en 10 minutos</p>
              </div>
              
              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Importante:</strong> No compartas este código con nadie. Si no solicitaste este código, ignora este email.</p>
              </div>
              
              <p>Saludos,<br>El equipo de ${platformName}</p>
            </div>
            <div class="footer">
              <p>${config?.footerText || '© 2024 Sistema de Rifas. Todos los derechos reservados.'}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: `${platformName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: email,
        subject: `🔐 Código de verificación - ${platformName}`,
        html: html
      });

      if (error) {
        console.error('Error enviando OTP:', error);
        throw error;
      }

      console.log('OTP enviado a:', email);
      return data;
    } catch (error) {
      console.error('Error en sendOTPEmail:', error);
      throw error;
    }
  }
}

export default new EmailService();


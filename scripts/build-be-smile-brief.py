from pathlib import Path
from xml.sax.saxutils import escape
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT=Path(__file__).resolve().parents[1]
BRAND=Path('/Users/cashkade/Downloads/ELEVATOR COMPANY New')
OUT=ROOT/'output/pdf/be-smile-requerimientos-web.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('Body','/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('Bold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
BLUE=HexColor('#1858FB'); CYAN=HexColor('#18BAFB'); INK=HexColor('#101116'); GRAY=HexColor('#596174'); LIGHT=HexColor('#F3F6FC'); LINE=HexColor('#DFE5F0')
W,H=595.276,841.89; M=44; CW=W-2*M
styles={
 'body':ParagraphStyle('body',fontName='Body',fontSize=10.2,leading=14.4,textColor=INK),
 'question':ParagraphStyle('question',fontName='Body',fontSize=10.2,leading=14.4,textColor=INK,leftIndent=10,firstLineIndent=-10),
 'small':ParagraphStyle('small',fontName='Body',fontSize=9.1,leading=12.8,textColor=GRAY),
 'cover-intro':ParagraphStyle('cover-intro',fontName='Body',fontSize=11,leading=16,textColor=HexColor('#BBC7DC')),
 'deliver':ParagraphStyle('deliver',fontName='Body',fontSize=9.1,leading=12.8,textColor=GRAY),
 'title':ParagraphStyle('title',fontName='Bold',fontSize=12.4,leading=16,textColor=INK),
 'note':ParagraphStyle('note',fontName='Body',fontSize=10.2,leading=14.4,textColor=INK),
}
# These 29 retained points follow the reviewed checklist. The two removed points
# (original 06.02 and 08.01) are intentionally omitted and retained points renumbered; Hector's additions are integrated.
def item(id,title,questions,deliver):return dict(id=id,title=title,q=questions,deliver=deliver)
PAGES=[
 dict(section='01',title='Marca y contacto',intro='Una identidad coherente y datos correctos en cada página. La información corresponde a la única sede de BE SMILE.',items=[
 item('01.01','Nombre, identidad y redes',[
 '¿Cuál es el nombre comercial exacto que debe aparecer en la web de BE SMILE?',
 '¿Qué logo, colores y redes sociales oficiales debemos utilizar? Incluyan los enlaces completos.'
 ],'Logo original en SVG, AI o PDF y versión PNG; códigos de color y enlaces de redes. Si existe manual de marca, adjuntarlo.'),
 item('01.02','Datos de la clínica',[
 '¿Cuál es la dirección completa de BE SMILE, enlace de Google Maps, horario, teléfono y WhatsApp con código de país?'
 ],'Una ficha de contacto de BE SMILE, con calle, número, colonia o barrio, ciudad, estado, país y código postal. Indicar diferencias entre horario de atención y respuesta.'),
 item('01.03','Correo, cobertura e idiomas',[
 '¿Cuál es el correo de contacto que debe mostrarse al público?',
 '¿Qué ciudades o barrios atienden y en qué idiomas pueden atender realmente a un paciente?'
 ],'Correo público, zonas de atención y listado de idiomas disponibles. Precisar si algún idioma depende de la disponibilidad de un profesional.'),
 ]),
 dict(section='02',title='Presentación de la clínica',intro='Pueden responder en texto o con un audio claro. Elevator redactará el contenido a partir de información real y aprobada.',items=[
 item('02.01','Historia y pacientes',[
 '¿Cómo nació BE SMILE, en qué año abrió y cuál es su historia breve?',
 '¿Qué tipo de pacientes atiende principalmente y qué necesidades suelen traer a consulta?'
 ],'Relato breve de la clínica y perfil de sus pacientes. Indicar el año de apertura de BE SMILE.'),
 item('02.02','Diferenciadores y enfoque',[
 '¿Cuáles son los tres motivos principales por los que un paciente debería elegir BE SMILE?',
 '¿Qué tratamientos quieren destacar y en qué orden de prioridad?'
 ],'Tres diferenciadores concretos y lista priorizada de tratamientos. Explicar qué respalda cada diferenciador: equipo, experiencia, proceso o servicio.'),
 item('02.03','Cifras que desean mostrar',[
 '¿Cuántos años de experiencia tiene la clínica y qué cantidad aproximada de pacientes desean comunicar?',
 '¿A qué período corresponde cada cifra y cómo fue calculada?'
 ],'Cifras verificables con fecha de corte y período. Distinguir pacientes únicos, consultas y tratamientos, según el dato disponible.'),
 item('02.04','Primera valoración',[
 '¿Qué incluye la primera valoración y cuánto cuesta? Indiquen moneda.',
 '¿Se descuenta ese importe del tratamiento? ¿Bajo qué condiciones?'
 ],'Descripción de la valoración, estudios incluidos o aparte, precio vigente y condiciones del descuento si aplica.'),
 ]),
 dict(section='03',title='Profesionales y equipo',intro='Repetir los puntos 03.01 a 03.03 por cada profesional que aparecerá en la web. Cada ficha debe corresponder a la persona presentada.',items=[
 item('03.01','Identificación y fotografía',[
 '¿Cuál es el nombre completo, cargo y especialidad de cada integrante?',
 '¿Qué tratamientos realiza en BE SMILE?'
 ],'Ficha por integrante y foto profesional original, preferentemente vertical y en buena resolución. Identificar el archivo con el nombre del profesional.'),
 item('03.02','Formación y registro',[
 '¿En qué universidad estudió y qué título obtuvo?',
 '¿Qué especialidades tiene y cuál es su cédula o registro profesional correspondiente?'
 ],'Universidad, títulos, especialidades y números de registro. Adjuntar documentación o enlaces oficiales para validar los datos que se publicarán.'),
 item('03.03','Experiencia y trayectoria',[
 '¿Cuántos años de experiencia tiene y cuáles son los hitos principales de su trayectoria?',
 '¿Qué cantidad aproximada de pacientes atendidos desea mostrar y a qué período corresponde?'
 ],'Biografía breve y cifras con período y fecha de corte. No duplicar cifras de la clínica como si fueran propias de cada profesional.'),
 item('03.04','Presentación del equipo',[
 '¿Tienen una fotografía actual del equipo completo?',
 '¿Existe un video de presentación del fundador que podamos utilizar? Si existe, ¿quién aparece y qué comunica?'
 ],'Foto original del equipo; video del fundador, si ya existe, y nombre/cargo de las personas que aparecen. Indicar si hay material pendiente.'),
 ]),
 dict(section='04',title='Tratamientos y precios',subtitle='Ficha por tratamiento · Parte 1 de 2',intro='La información de los puntos 04.02 a 04.05 debe repetirse por cada tratamiento que se publicará.',items=[
 item('04.01','Oferta real y prioridades',[
 '¿Qué tratamientos ofrece BE SMILE actualmente?',
 '¿Cuáles son los prioritarios para atraer pacientes y cuáles tienen mayor enfoque y rentabilidad para la clínica?'
 ],'Lista de servicios disponibles y orden de prioridad. Indicar con qué profesional se ofrece cada uno.'),
 item('04.02','Objetivo, paciente y beneficios',[
 'Por tratamiento: ¿qué problema resuelve, para quién está indicado y cuáles son sus beneficios principales?',
 '¿Qué expectativas deben aclararse al paciente y en qué casos requiere valoración para definir su opción?'
 ],'Explicación en lenguaje claro, validada por el responsable clínico. Evitar resultados garantizados o beneficios que BE SMILE no pueda respaldar.'),
 item('04.03','Proceso, citas, tiempos y cuidados',[
 '¿Cuáles son las etapas, cuántas citas requiere aproximadamente, cuánto dura y qué cuidados principales necesita?',
 'Para implantes: ¿qué tiempos aproximados manejan para el procedimiento y recuperación, la cicatrización, el destape y la colocación de la corona?',
 '¿Qué materiales utilizan y recomiendan para las coronas sobre implantes? ¿Qué factores pueden modificar los tiempos?'
 ],'Pasos y rangos de tiempo aprobados por el profesional. Incluir materiales, cuidados y variaciones según valoración; no usar una duración única para todos los pacientes.'),
 ]),
 dict(section='04',title='Tratamientos y precios',subtitle='Ficha por tratamiento · Parte 2 de 2',intro='Completar precios y dudas por servicio. Para promociones, entregar al menos dos paquetes definidos y listos para preparar su presentación.',items=[
 item('04.04','Precio e inclusiones',[
 '¿Cuál es el precio o debe mostrarse “según valoración”? ¿En qué moneda y por qué unidad: pieza, arcada, sesión o tratamiento?',
 '¿Qué incluye y qué se cobra aparte? ¿Desde qué fecha está vigente?'
 ],'Precio vigente o criterio de valoración, moneda, inclusiones y cargos adicionales. Mantener coherencia con la primera valoración y las promociones.'),
 item('04.05','Tres dudas frecuentes',[
 '¿Cuáles son las tres dudas más frecuentes que hacen los pacientes sobre cada tratamiento?',
 '¿Cuál es la respuesta aprobada para cada una? Utilizar dudas y ejemplos provenientes de casos reales.'
 ],'Tres preguntas y tres respuestas por tratamiento. Los ejemplos clínicos deben ser reales y presentarse sin datos que identifiquen al paciente.'),
 item('04.06','Pagos y dos paquetes de promociones',[
 '¿Qué métodos de pago y opciones de financiamiento ofrecen? Indiquen proveedor y condiciones, si aplica.',
 'Por cada uno de al menos dos paquetes: ¿cuál es el nombre, tratamiento, beneficio, precio, moneda, inclusiones, vigencia y condiciones?',
 '¿Quién autoriza su activación o desactivación desde el Dashboard y qué mensaje y llamada a la acción tendrá su popup predeterminado?'
 ],'Ficha de cada paquete, restricciones, precio regular/promocional cuando corresponda y contenido del popup. Definir responsable y fechas para preparar el flujo de activación solicitado.'),
 ]),
 dict(section='05',title='Equipos y tecnología',intro='Solicitamos información de tecnología que BE SMILE utiliza realmente. Diferenciar lo disponible en la clínica de lo contratado a un proveedor.',items=[
 item('05.01','Inventario interno',[
 '¿Qué equipos y tecnologías tienen: escáner, tomógrafo, láser, CAD/CAM, software u otros?',
 '¿Cuál es la marca y el modelo de cada equipo disponible en BE SMILE?'
 ],'Inventario con nombre del equipo, marca y modelo. Incluir software relevante si participa en diagnóstico, planificación o tratamiento.'),
 item('05.02','Uso y beneficio para el paciente',[
 '¿Para qué tratamientos utilizan cada equipo o tecnología y qué beneficio concreto aporta al paciente?',
 '¿Es propio de BE SMILE o de un laboratorio/proveedor externo?'
 ],'Relación equipo-tratamiento-beneficio, validada por el profesional. Indicar claramente cuando el servicio se realiza fuera de la clínica.'),
 item('05.03','Marcas y fotografías reales',[
 '¿Qué marcas de implantes, alineadores y materiales principales utilizan?',
 '¿Qué fotografías reales de esos equipos y materiales pueden compartir para la web?'
 ],'Listado de marcas y fotos originales de los equipos. Facilitar material autorizado de fabricantes únicamente cuando se tenga derecho de uso.'),
 ],note='Para fotografiar tecnología: usar buena luz, mostrar el equipo completo y añadir el nombre o modelo al archivo. Elevator adapta los formatos para la web.'),
 dict(section='06',title='Fotos, videos y resultados',intro='Entregar archivos originales en una carpeta compartida. Los casos reales se organizan por tratamiento y las autorizaciones acompañan al material.',items=[
 item('06.01','Fotografías de la clínica',[
 '¿Pueden enviar entre 6 y 10 fotos de BE SMILE: fachada, recepción, consultorios e instalaciones?'
 ],'Fotos originales, identificadas por espacio de la clínica. Incluir tomas horizontales y suficiente espacio para adaptar el recorte a móvil.'),
 item('06.02','Material por tratamiento',[
 '¿Qué imagen representativa tienen para cada tratamiento y qué videos explicativos ya existen?'
 ],'Una imagen por tratamiento y los videos existentes, con nombre del servicio y confirmación del derecho de uso.'),
 item('06.03','Antes y después por tratamiento',[
 '¿Qué casos reales pueden enviar por cada tratamiento: fotos, procedimiento realizado y breve explicación del resultado?'
 ],'Recomendación: 6 casos por tratamiento; mínimo solicitado: 3. Pueden enviar más. Vincular antes/después del mismo caso y adjuntar su autorización firmada.'),
 item('06.04','Reseñas y testimonios',[
 '¿Cuál es el enlace de las reseñas de Google y qué 3 a 5 testimonios propios quieren incluir? ¿Tienen testimonios en video?'
 ],'Enlace original y testimonios con fuente; videos si existen. Precisar qué nombre o identificación está autorizado para mostrarse.'),
 item('06.05','Autorizaciones y derechos de uso',[
 '¿Cuentan con autorización firmada para publicar cada foto, caso o testimonio de paciente y con derechos de uso del material?'
 ],'Confirmación y documentos de autorización correspondientes. Elevator Dental Web no publicará material de pacientes sin autorización firmada para el uso público de su imagen.'),
 ]),
 dict(section='07',title='Agenda, dominio y legales',intro='Definir el destino de cada solicitud y reunir los documentos propios de BE SMILE. Los accesos se comparten mediante invitaciones.',items=[
 item('07.01','Solicitudes y reservas',[
 '¿Quién recibe y responde las solicitudes? ¿A qué WhatsApp o correo deben llegar?',
 '¿Qué agenda o CRM utilizan? ¿Tienen un enlace de reserva? ¿El formulario solicita una cita o confirma un horario real?'
 ],'Contacto de destino, responsable y enlace de agenda si existe.'),
 item('07.02','Dominio y acceso técnico',[
 '¿Qué dominio utilizará BE SMILE y quién administra el dominio y su publicación?',
 '¿A qué herramientas deben invitarnos para publicar la web y conectar la agenda?'
 ],'Dominio y contacto del administrador. Compartir permisos por invitación y por el canal acordado con Elevator; no escribir contraseñas en las respuestas.'),
 item('07.03','Privacidad y condiciones',[
 '¿Cuáles son los datos legales de BE SMILE y quién es responsable de privacidad?',
 '¿Qué aviso de privacidad y condiciones de citas, cancelaciones y pagos deben publicarse?'
 ],'Documentos vigentes aprobados por la clínica, razón social, domicilio y correo de privacidad. Indicar fecha o versión de cada documento.'),
 item('07.04','Publicidad y COFEPRIS',[
 'Si BE SMILE opera en México: ¿cuentan con el permiso o aviso de publicidad que corresponde a su actividad y con su número o folio?',
 '¿Pueden entregar copia del documento? Si está pendiente, ¿quién gestionará el trámite y cuál es su estado?'
 ],'Folio y copia del permiso o aviso aplicable. Si falta, revisar las rutas oficiales indicadas al final del documento con el responsable de la clínica.'),
 ]),
]

c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('BE SMILE | Preguntas y requerimientos para crear su web')
c.setAuthor('Elevator Dental Web');c.setSubject('Brief de 29 puntos adaptado a la revisión de Héctor. Identidad, tratamientos, materiales, agenda y documentación.')

images={}
def img(name):
 if name not in images:
  im=Image.open(BRAND/name).convert('RGBA');im=im.crop(im.getbbox());im.thumbnail((1800,1200));images[name]=(ImageReader(im),im.width/im.height)
 return images[name]
def drawimg(name,x,y,w):
 im,r=img(name);c.drawImage(im,x,y,width=w,height=w/r,mask='auto')
def para(text,x,y,w,kind='body'):
 p=Paragraph(text,styles[kind]);_,h=p.wrap(w,1000);p.drawOn(c,x,y-h);return h

def footer(n,dark=False):
 c.setStrokeColor(HexColor('#2A2C35') if dark else LINE);c.setLineWidth(.6);c.line(M,48,W-M,48)
 c.setFillColor(HexColor('#A5AFBF') if dark else GRAY);c.setFont('Body',8)
 c.drawString(M,30,'BE SMILE  /  Requerimientos para su web')
 c.drawRightString(W-M,30,f'{n:02} / 10')

def header(n,sec,title,intro,subtitle=None):
 c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0)
 drawimg('Logotipo/LOGOTIPO_COLOR_NEGRO.png',M,H-69,116)
 c.setFillColor(GRAY);c.setFont('Body',8);c.drawRightString(W-M,H-58,'BE SMILE  /  BRIEF DE PRODUCCIÓN')
 c.setFillColor(BLUE);c.setFont('Bold',9);c.drawString(M,H-114,f'{sec}  /  INFORMACIÓN Y ENTREGABLES')
 c.setFillColor(INK);c.setFont('Bold',25);c.drawString(M,H-150,title)
 y=H-167
 if subtitle:
  c.setFillColor(BLUE);c.setFont('Bold',10);c.drawString(M,y-8,subtitle);y-=27
 h=para(escape(intro),M,y,CW,'small');y-=h+21
 footer(n)
 return y

def card(it,y):
 x=M+41;ww=CW-41
 parts=[]
 p=Paragraph(escape(it['title']),styles['title']);_,hh=p.wrap(ww,1000);parts.append((p,hh,7))
 for q in it['q']:
  p=Paragraph('• '+escape(q),styles['question']);_,hh=p.wrap(ww,1000);parts.append((p,hh,3))
 p=Paragraph('<b>Entregar:</b> '+escape(it['deliver']),styles['deliver']);_,hh=p.wrap(ww,1000);parts.append((p,hh,0))
 height=sum(h+g for _,h,g in parts)+20
 if y-height<66:raise ValueError(f"Card overflows page: {it['id']} bottom={y-height}")
 c.setFillColor(BLUE);c.setFont('Bold',9);c.drawString(M,y-12,it['id'])
 yy=y
 for p,h,g in parts:
  p.drawOn(c,x,yy-h);yy-=h+g
 c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(x,yy-11,W-M,yy-11)
 return y-height-13

# Cover: original logo/isotype and brand palette, with generous clear space.
c.setFillColor(HexColor('#000000'));c.rect(0,0,W,H,fill=1,stroke=0)
drawimg('Logotipo/LOGOTIPO_COLOR_BLANCO.png',M,H-109,220)
c.setFillColor(CYAN);c.setFont('Bold',10);c.drawString(M,642,'ELEVATOR DENTAL WEB  /  DOCUMENTO DE INICIO')
c.setFillColor(white);c.setFont('Bold',54);c.drawString(M,565,'BE SMILE')
c.setFont('Bold',27);c.drawString(M,519,'Preguntas y requerimientos')
c.drawString(M,483,'para crear su web.')
c.setFillColor(HexColor('#BBC7DC'));c.setFont('Body',11)
para('La información, los archivos y las aprobaciones que necesitamos para construir una web fiel a su clínica.',M,451,430,'cover-intro')
# Colored topographic lines based on the brand's angular isotype, no altered logo.
drawimg('Isotipo/ISOTIPO_COLOR.png',W-160,211,111)
c.setFillColor(BLUE);c.rect(M,316,83,4,fill=1,stroke=0)
c.setFillColor(white);c.setFont('Bold',20);c.drawString(M,279,'29 puntos. 7 áreas de trabajo.')
c.setFillColor(HexColor('#AEBACE'));c.setFont('Body',10)
c.drawString(M,252,'Marca · Clínica · Equipo · Tratamientos')
c.drawString(M,232,'Tecnología · Material visual · Agenda y legales')
c.setFillColor(HexColor('#181B22'));c.roundRect(M,88,CW,100,10,fill=1,stroke=0)
c.setFillColor(CYAN);c.setFont('Bold',10);c.drawString(M+18,164,'CÓMO COMPLETAR ESTE BRIEF')
coverstyle=ParagraphStyle('cover',fontName='Body',fontSize=9.5,leading=14,textColor=HexColor('#D6DEEB'))
p=Paragraph('Respondan por número de punto en un documento compartido y enlacen los archivos correspondientes. Repitan las fichas por profesional y tratamiento. Si algo falta, indiquen “Pendiente”, responsable y fecha; si no aplica, expliquen el motivo.',coverstyle);_,hh=p.wrap(CW-36,1000);p.drawOn(c,M+18,146-hh)
footer(1,True);c.showPage()

for n,p in enumerate(PAGES,2):
 y=header(n,p['section'],p['title'],p['intro'],p.get('subtitle'))
 for it in p['items']:y=card(it,y)
 if p.get('note'):
  hh=para('<b>Preparación del material:</b> '+escape(p['note']),M,y-4,CW,'small')
  if y-hh<66:raise ValueError('Note overflow')
 c.showPage()

# Delivery page / operational checklist.
y=header(10,'ENTREGA','Cómo reunir la información','Entreguen un documento con las respuestas numeradas y una carpeta compartida con acceso para el equipo de Elevator.')
c.setFillColor(LIGHT);c.roundRect(M,y-69,CW,69,7,fill=1,stroke=0)
para('<b>En el documento de respuestas</b><br/>Identificar BE SMILE, fecha y versión. Responder los 29 puntos; marcar lo pendiente con responsable y fecha. Añadir el enlace de cada archivo o subcarpeta.',M+15,y-13,CW-30)
y-=90
c.setFillColor(BLUE);c.setFont('Bold',10);c.drawString(M,y,'CARPETA COMPARTIDA: BE-SMILE / WEB');y-=25
folders=[
 ('01 Marca y contacto','Logo, manual, redes y ficha de contacto de BE SMILE.'),
 ('02 Clínica y equipo','Historia, diferenciadores, cifras y fichas de profesionales.'),
 ('03 Tratamientos y promociones','Fichas por servicio, precios, dudas y al menos dos paquetes.'),
 ('04 Tecnología','Inventario, marcas y fotos de equipos reales.'),
 ('05 Fotos y casos','Instalaciones, material por tratamiento y casos antes/después.'),
 ('06 Testimonios y autorizaciones','Reseñas, videos existentes y autorizaciones firmadas vinculadas.'),
 ('07 Agenda y legales','Datos de agenda, dominio, privacidad y documentos de publicidad.'),
]
for name,desc in folders:
 c.setFillColor(INK);c.setFont('Bold',9.5);c.drawString(M,y,name)
 h=para(escape(desc),M+182,y+9,CW-182,'small');y-=max(h,18)+12
c.setStrokeColor(LINE);c.line(M,y+3,W-M,y+3);y-=17
h=para('<b>Formatos y nombres de archivo</b><br/>Fotos originales JPG o PNG; videos existentes MP4 o MOV; documentos PDF; logos vectoriales cuando estén disponibles. Eviten archivos comprimidos por WhatsApp. Usen nombres que identifiquen espacio de la clínica, persona, tratamiento y caso. Elevator adaptará tamaños y formatos.',M,y,CW,'small');y-=h+18
h=para('<b>Antes de publicar</b><br/>BE SMILE valida textos, precios, tiempos clínicos, contactos y documentos. Cada caso o testimonio de paciente debe contar con autorización firmada. Los accesos técnicos se conceden por invitación, sin incluir contraseñas en este brief.',M,y,CW,'small');y-=h+18
h=para('<b>COFEPRIS: rutas oficiales si el documento está pendiente</b><br/>Confirmar con el responsable de la clínica si corresponde permiso o aviso de publicidad. Estas son las páginas oficiales para consultar la modalidad y el proceso:',M,y,CW,'small');y-=h+8
for label,url in [
 ('Permiso de publicidad','https://www.gob.mx/cofepris/acciones-y-programas/permiso-publicitario'),
 ('Aviso de publicidad','https://www.gob.mx/public/tramites/detalleTramite.xhtml?homoclave=COFEPRIS-02-002-A'),
 ('Portal de trámites DIGIPRiS','https://digipris.cofepris.gob.mx/')]:
 h=para(f'<link href="{url}" color="#1858FB"><u>{label}</u></link>',M,y,CW,'small');y-=h+3
h=para('Fuentes oficiales consultadas el 8 de octubre de 2026. La modalidad depende de la actividad que se publicita.',M,y-3,CW,'small');y-=h+3
if y<62:raise ValueError(f'Delivery page overflow {y}')
c.showPage();c.save()
print(OUT)
print('29 retained points:',sum(len(p['items']) for p in PAGES))

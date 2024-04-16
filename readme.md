# Crear UPGs

## Introducción

Esta utilidad se utiliza para crear las tablas UPG asociadas a las migraciones.

Después de copiar los campos y tablas personalizados a una instancia de la versión NAV14 C/Side es necesario almacenar esos datos en unas tablas temporales mientras lo migramos a el formato de extensiones.

Esta solución coge los objetos de la versión 14 que hemos modificado, exportados como .txt y generará un fichero .txt con las tablas UPG necesarias.

Adicionalmente nos permite obtener la estructura de las tablas en formato JSON en caso de que pudiese usarse para otras cosas.

> Nota: Las tablas UPG no contienen código ni a nivel de tabla ni campos, tan solo se obtiene la estructura básica de campos y claves

## Requisitos

Es necesario instalar las siguientes dependencias

- https://nodejs.org/en/download


## Uso

Instrucciones

1. Instalar Node.js y npm desde el link especificado
   
2. Abrir la consola (escribe CMD en el buscador)
   
3. Ejecuta el fichero con el comando 
   ```
   node CreateUPGs.js
   ```
   >Si la consola no está abierta en la misma carpeta que el proyecto utilizar la ruta completa
    - Selecciona el fichero de origen de tablas exportadas en formato .txt
    - Selecciona el directorio de destino del fichero que se va a generar
    - Selecciona si deseas exportar el formato de las tablas como JSON o un fichero con los objetos UPG



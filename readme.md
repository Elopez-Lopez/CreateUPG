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
   
   <img src="https://github.com/Elopez-Lopez/CreateUPG/assets/107472068/3657a1a9-057c-4d85-b92a-1a5f923a7dfb" width="500" height="300">
   
3. Abrir la consola (escribe CMD en el buscador) o haciendo click derecho en la carpeta
   
   <img src="https://github.com/Elopez-Lopez/CreateUPG/assets/107472068/31121c1a-0ad0-4f00-bd69-a98863cd6d75" width="500" height="300">
   
5. Ejecuta el fichero con el comando 
   ```
   node CreateUPGs.js
   ```
   <img src="https://github.com/Elopez-Lopez/CreateUPG/assets/107472068/e2b4f336-1c98-45ef-a952-22fc290ccfb6" width="500" height="180">
   
   >Si la consola no está abierta en la misma carpeta que el proyecto utilizar la ruta completa
    - Selecciona el fichero de origen de tablas exportadas en formato .txt
    - Selecciona el directorio de destino del fichero que se va a generar
    - Selecciona si deseas exportar el formato de las tablas como JSON o un fichero con los objetos UPG

      
   



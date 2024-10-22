

declare module 'swagger-jsdoc' {
    import { SwaggerDefinition, Options } from 'swagger-schema-official';
  
    function swaggerJSDoc(options: Options): SwaggerDefinition;
  
    export default swaggerJSDoc;
  }
  
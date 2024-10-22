declare module 'reflect-metadata' {
    export function decorate(decorators: Function[], target: any, propertyKey?: string | symbol): void;
    export function defineMetadata(metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol): void;
    export function getMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): any;
    export function hasMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): boolean;
    export function deleteMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): boolean;
    export function definePropertyMetadata(metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol): void;
    export function getOwnMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): any;
    export function getOwnMetadataKeys(target: any, propertyKey?: string | symbol): any[];
    export function getMetadataKeys(target: any, propertyKey?: string | symbol): any[];
}

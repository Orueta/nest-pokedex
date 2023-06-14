import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// Indicar que es un esquema de MongoDB
@Schema()
export class Pokemon extends Document {
    // id: string; Mongodb lo genera
    // Properties: Define propiedades para el elemento de la entidad
    @Prop({
        unique: true,
        index: true,
    })
    name: string;
    
    @Prop({
        unique: true,
        index: true,
    })
    no: number;    

}


export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

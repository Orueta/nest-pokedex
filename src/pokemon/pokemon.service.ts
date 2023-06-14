import { Model, isValidObjectId } from 'mongoose';
import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {
  // Inyectar modelos para guardar en db
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  //! Registrar un pokemon
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    // Manejar error de registros duplicados
    try {
      // Insertar datos en la db
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      // Regresamos la datas registrada
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  //! Obtener todos los pokemones
  findAll() {
    const pokemon = this.pokemonModel.find();
    return pokemon;
  }

  //! Obtener un pokemon (id, numero, nombre)
  async findOne(term: string) {
    let pokemon: Pokemon;

    // verificar si el term es numerico
    if (!isNaN(+term)) {
      // Buscar el registro en la db
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    // Busqueda por MongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    // Busqueda por nombre
    if (!pokemon) {
      pokemon = await  this.pokemonModel.findOne({name: term.toLowerCase().trim()})
    }

    // Excepcion en caso de que el pokemon no exista
    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)

    // Retornar el registro encontrado
    return pokemon;
  }

  //! Actualizar un pokemon
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    // Verificar si el registor existe en la db
    // Utilizamos el metodo para obtener un pokemon
    const pokemon = await this.findOne(term); 
    
    // Transformar nombre a minuscula
    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    
    // Manejar errores de registros duplicados
    try {
      // Guardar cambios en la db
      await pokemon.updateOne(updatePokemonDto);
  
      // Retornar el objeto con los cambios realizados
      return {...pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  //! Eliminar un pokemon
  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount === 0) throw new BadRequestException(`Pokemon witdh id "${id}" not found`);
    
    return;
  }

  // Manejador de excepciones
  private handleExceptions(error: any) {
     // Error 11000: registro duplicado
    if (error.code === 11000) {
      throw new BadGatewayException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`);
    }

    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }

}

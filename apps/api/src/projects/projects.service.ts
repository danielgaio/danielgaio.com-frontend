import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProjectsService {
  constructor(
  
  ) {}

  // async create(
  //   name: string,
  //   description: string,
  //   url: string,
  //   user: User
  // ): Promise<Project> {
  //   const project = this.projectsRepository.create({
  //     name,
  //     description,
  //     url,
  //     user,
  //   });
  //   return this.projectsRepository.save(project);
  // }

  // async findAll(): Promise<Project[]> {
  //   return this.projectsRepository.find({ relations: ["user"] });
  // }
}

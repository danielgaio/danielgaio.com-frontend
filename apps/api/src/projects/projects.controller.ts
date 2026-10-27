import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // async create(
  //   @Body()
  //   createProjectDto: { name: string; description: string; url: string },
  //   @Request() req
  // ) {
  //   return this.projectsService.create(
  //     createProjectDto.name,
  //     createProjectDto.description,
  //     createProjectDto.url,
  //     req.user
  //   );
  // }

  // @Get()
  // async findAll() {
  //   return this.projectsService.findAll();
  // }
}

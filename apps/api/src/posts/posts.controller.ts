import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
// import { PostsService } from "./posts.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("posts")
export class PostsController {
  constructor(
    // private readonly postsService: PostsService
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // async create(
  //   @Body() createPostDto: { title: string; content: string },
  //   @Request() req
  // ) {
  //   return this.postsService.create(
  //     createPostDto.title,
  //     createPostDto.content,
  //     req.user
  //   );
  // }

  // @Get()
  // async findAll() {
  //   return this.postsService.findAll();
  // }
}

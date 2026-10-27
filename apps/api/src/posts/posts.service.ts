// import { Injectable } from "@nestjs/common";
// import { Post, User } from "@prisma/client";
// import { PrismaService } from "../prisma/prisma.service";

// @Injectable()
// export class PostsService {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(title: string, content: string, user: User): Promise<Post> {
//     return this.prisma.post.create({
//       data: {
//         title,
//         content,
//         user
//       }
//     });
//   }

//   async findAll(): Promise<Post[]> {
//     return this.prisma.post.findMany({ include: {user: true} });
//   }
// }

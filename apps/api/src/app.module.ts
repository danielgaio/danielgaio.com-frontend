import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { PostsModule } from "./posts/posts.module";
import { ProjectsModule } from "./projects/projects.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./auth/jwt.strategy";
import { LocalStrategy } from "./auth/local.strategy";
import { jwtConstants } from "./auth/constants";
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60m" },
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    ProjectsModule,
  ],
  controllers: [],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AppModule {}

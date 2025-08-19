import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ComponentsService } from "./components.service";

@Controller()
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get("handshake")
  handshake() {
    return this.componentsService.handshake();
  }

  @Get("allcomponents")
  getAllComponentNames() {
    return this.componentsService.getAllComponentNames();
  }

  @Get("count")
  getComponentCount() {
    return this.componentsService.getComponentCount();
  }

  @Get("components")
  getAllComponents() {
    return this.componentsService.getAllComponents();
  }

  @Post("categories/:category/components")
  @UseInterceptors(FileInterceptor("image"))
  createComponent(
    @Param() params: { category: string },
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.componentsService.createComponent(params, body, file);
  }

  @Put("components/resources/:id")
  updateResources(@Param() params: { id: string }, @Body() body: any) {
    return this.componentsService.updateComponentResources(params, body);
  }

  @Put("categories/:category/components/:id")
  @UseInterceptors(FileInterceptor("image"))
  updateComponent(
    @Param() params: { category: string; id: string },
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.componentsService.updateComponent(params, body, file);
  }

  @Delete("components/:id")
  deleteComponent(@Param() params: { id: string }) {
    return this.componentsService.deleteComponent(params);
  }
}

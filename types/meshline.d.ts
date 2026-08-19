import type { Object3DNode } from "@react-three/fiber";
import type { MeshLineGeometry, MeshLineMaterial } from "meshline";

declare module "meshline" {
  export class MeshLineGeometry {
    setPoints(points: import("three").Vector3[]): void;
  }

  export class MeshLineMaterial {}
}
declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: Object3DNode<MeshLineMaterial, typeof MeshLineMaterial> & {
      color?: string;
      depthTest?: boolean;
      resolution?: [number, number];
      useMap?: boolean;
      map?: import("three").Texture;
      repeat?: [number, number];
      lineWidth?: number;
    };
  }
}

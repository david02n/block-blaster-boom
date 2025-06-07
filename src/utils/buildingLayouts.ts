export interface BuildingLayout {
  name: string;
  grid: number[][];
  objects: {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    texture: string;
  }[];
  blockTypes: {
    [key: number]: {
      texture: string;
      width: number;
      height: number;
    };
  };
}

export const CHINA_BUILDING: BuildingLayout = {
  name: 'China Pagoda',
  grid: [
    [0,0,0,0,2,2,2,2,2,2,0,0,0,0],
    [0,0,0,2,2,2,2,2,2,2,2,0,0,0],
    [0,0,2,2,2,2,2,2,2,2,2,2,0,0],
    [0,2,1,1,1,1,1,1,1,1,1,1,2,0],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [1,1,1,3,1,1,1,1,1,1,3,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,1,1,1,1,1],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,2]
  ],
  objects: [
    {
      type: 'character',
      x: 5, // column in grid
      y: 7, // row in grid
      w: 3, // width in grid units
      h: 4, // height in grid units
      texture: '/lovable-uploads/chyna_exporter.png'
    }
  ],
  blockTypes: {
    0: { texture: '', width: 1, height: 1 }, // Empty space
    1: { texture: '/lovable-uploads/chyna_wall.png', width: 1, height: 1 }, // Wall
    2: { texture: '/lovable-uploads/chyna_roof.png', width: 1, height: 1 }, // Roof
    3: { texture: '/lovable-uploads/chyna_door.png', width: 1, height: 1 } // Door
  }
};

class Planet{
    constructor(name, radius, color, texture){
        this.name = name;
        this.radius = radius;
        this.color = color;
        this.texture = `./textures/2k_${texture}.jpg`;
        this.mesh = null;
    }

    setMesh(mesh){
        this.mesh = mesh;
    }

}

export default Planet;
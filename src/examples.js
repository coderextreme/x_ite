var X_ITE_EXAMPLES = [
	{ component: "Basic", test: "Appartment" },
	{ component: "Basic", test: "Approach" },
	{ component: "Basic", test: "Arcadia" },
	{ component: "Basic", test: "Astronomy" },
	{ component: "Basic", test: "BIC" },
	{ component: "Basic", test: "BeyondGermany" },
	{ component: "Basic", test: "BoyzNoise" },
	{ component: "Basic", test: "Chomp" },
	{ component: "Basic", test: "Circles" },
	{ component: "Basic", test: "CrazySpiral" },
	{ component: "Basic", test: "Currencies" },
	{ component: "Basic", test: "FlashingLights" },
	{ component: "Basic", test: "FoldUp" },
	{ component: "Basic", test: "LogoPieces" },
	{ component: "Basic", test: "LustForLife" },
	{ component: "Basic", test: "MagicMushrooms" },
	{ component: "Basic", test: "MilkywayAndBeyond" },
	{ component: "Basic", test: "Pong" },
	{ component: "Basic", test: "SecretLabyrinth" },
	{ component: "Basic", test: "SlidingPuzzle" },
	{ component: "Basic", test: "SmartyBubbles" },
	{ component: "Basic", test: "SmashingBoxes" },
	{ component: "Basic", test: "SugarSmack" },
	{ component: "Basic", test: "TikiWorld" },
	{ component: "Basic", test: "TreasureIsland" },
	{ component: "Basic", test: "Vattenfall" },
	{ component: "Basic", test: "WaterQuality" },
	{ component: "CADGeometry", test: "QuadSet" },
	{ component: "CubeMapTexturing", test: "ComposedCubeMapTexture" },
	{ component: "EnvironmentalEffects", test: "Background" },
	{ component: "EnvironmentalEffects", test: "Fog" },
	{ component: "EnvironmentalEffects", test: "LocalFog" },
	{ component: "EnvironmentalEffects", test: "TextureBackground" },
	{ component: "EnvironmentalSensor", test: "ProximitySensor" },
	{ component: "EnvironmentalSensor", test: "TransformSensor" },
	{ component: "EnvironmentalSensor", test: "VisibilitySensor" },
	{ component: "EventUtilities", test: "IntegerSequencer" },
	{ component: "Follower", test: "ColorChaser" },
	{ component: "Follower", test: "ColorDamper" },
	{ component: "Follower", test: "ScalarChaser" },
	{ component: "Geometry2D", test: "Arc2D" },
	{ component: "Geometry2D", test: "ArcClose2D" },
	{ component: "Geometry2D", test: "Circle2D" },
	{ component: "Geometry2D", test: "Disk2D" },
	{ component: "Geometry2D", test: "Polyline2D" },
	{ component: "Geometry2D", test: "Polypoint2D" },
	{ component: "Geometry2D", test: "Rectangle2D" },
	{ component: "Geometry2D", test: "TriangleSet2D" },
	{ component: "Geometry3D", test: "Box" },
	{ component: "Geometry3D", test: "Cone" },
	{ component: "Geometry3D", test: "Cylinder" },
	{ component: "Geometry3D", test: "ElevationGrid" },
	{ component: "Geometry3D", test: "Extrusion" },
	{ component: "Geometry3D", test: "IndexedFaceSet" },
	{ component: "Geometry3D", test: "Sphere" },
	{ component: "Geospatial", test: "GeoElevationGrid" },
	{ component: "Geospatial", test: "GeoViewpoint" },
	{ component: "Grouping", test: "Group" },
	{ component: "Grouping", test: "Switch" },
	{ component: "Grouping", test: "Transform" },
	{ component: "Interpolation", test: "ColorInterpolator" },
	{ component: "Interpolation", test: "CoordinateInterpolator" },
	{ component: "Interpolation", test: "OrientationInterpolator" },
	{ component: "Interpolation", test: "PositionInterpolator" },
	{ component: "Interpolation", test: "PositionInterpolator2D" },
	{ component: "Interpolation", test: "ScalarInterpolator" },
	{ component: "Interpolation", test: "SplineScalarInterpolator" },
	{ component: "Interpolation", test: "SquadOrientationInterpolator" },
	{ component: "Layering", test: "LayerSet" },
	{ component: "Layering", test: "Viewport" },
	{ component: "Lighting", test: "DirectionalLight" },
	{ component: "Lighting", test: "PointLight" },
	{ component: "Lighting", test: "Shadows" },
	{ component: "Lighting", test: "SpotLight" },
	{ component: "Navigation", test: "Billboard" },
	{ component: "Navigation", test: "Collision" },
	{ component: "Navigation", test: "NavigationInfo" },
	{ component: "Navigation", test: "Viewpoint" },
	{ component: "Networking", test: "Anchor" },
	{ component: "Networking", test: "Inline" },
	{ component: "Networking", test: "LoadSensor" },
	{ component: "ParticleSystems", test: "ConeEmitter" },
	{ component: "ParticleSystems", test: "ExplosionEmitter" },
	{ component: "ParticleSystems", test: "ForcePhysicsModel" },
	{ component: "ParticleSystems", test: "ParticleSystem" },
	{ component: "ParticleSystems", test: "PointEmitter" },
	{ component: "ParticleSystems", test: "PolylineEmitter" },
	{ component: "ParticleSystems", test: "SurfaceEmitter" },
	{ component: "ParticleSystems", test: "VolumeEmitter" },
	{ component: "ParticleSystems", test: "WindPhysicsModel" },
	{ component: "PointingDeviceSensor", test: "CylinderSensor" },
	{ component: "PointingDeviceSensor", test: "PlaneSensor" },
	{ component: "Rendering", test: "ClipPlane" },
	{ component: "Rendering", test: "Color" },
	{ component: "Rendering", test: "Coordinate" },
	{ component: "Rendering", test: "IndexedLineSet" },
	{ component: "Rendering", test: "IndexedTriangleSet" },
	{ component: "Rendering", test: "LineSet" },
	{ component: "Rendering", test: "PointSet" },
	{ component: "RigidBodyPhysics", test: "BallJoint" },
	{ component: "RigidBodyPhysics", test: "CollidableShape" },
	{ component: "RigidBodyPhysics", test: "CollisionCollection" },
	{ component: "RigidBodyPhysics", test: "RigidBody" },
	{ component: "RigidBodyPhysics", test: "RigidBodyCollection" },
	{ component: "RigidBodyPhysics", test: "SingleAxisHingeJoint" },
	{ component: "RigidBodyPhysics", test: "SliderJoint" },
	{ component: "Shaders", test: "ComposedShader" },
	{ component: "Shaders", test: "FloatVertexAttribute" },
	{ component: "Shaders", test: "ShaderPart" },
	{ component: "Shape", test: "Appearance" },
	{ component: "Shape", test: "Material" },
	{ component: "Shape", test: "TwoSidedMaterial" },
	{ component: "Text", test: "FontStyle" },
	{ component: "Text", test: "Text" },
	{ component: "Texturing", test: "MovieTexture" },
	{ component: "Texturing", test: "PixelTexture" },
	{ component: "Time", test: "TimeSensor" },
	{ component: "X_ITE", test: "BlendMode" },
];
X_ITE_EXAMPLES .server = "http://media.create3000.de/components";

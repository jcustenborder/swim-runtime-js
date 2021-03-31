const mesh = [
  {
    id: "warp",
    name: "@swim/warp",
    targets: [
      {
        id: "main",
      },
      {
        id: "test",
        deps: ["warp"],
      },
    ],
  },
  {
    id: "client",
    name: "@swim/client",
    targets: [
      {
        id: "main",
        deps: ["warp"],
      },
      {
        id: "test",
        deps: ["warp", "client"],
      },
    ],
  },
  {
    id: "cli",
    name: "@swim/cli",
    targets: [
      {
        id: "main",
        deps: ["warp", "client"],
      },
    ],
  },
  {
    id: "mesh",
    name: "@swim/mesh",
    title: "Swim Mesh",
    framework: true,
    targets: [
      {
        id: "main",
        deps: ["warp", "client"],
      },
    ],
  },
];

export default {
  version: "3.10.2",
  projects: mesh,
};

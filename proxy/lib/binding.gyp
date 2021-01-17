{
  "targets": [
    {
      "target_name": "index",
      "sources": [
        "main.cc",
        "<!@(node -p \"require('fs').readdirSync('./src').map(f=>'src/'+f).join(' ')\")"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "include/"
      ],
      "conditions": [
        [
          "OS==\"win\"",
          {
            "libraries": ["winmm.lib", "ws2_32.lib"]
          }
        ]
      ]
    }
  ]
}
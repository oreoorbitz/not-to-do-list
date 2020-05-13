module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    sass: {
      // Task
      dist: {
        // Target
        options: {
          // Target options
          style: "expanded"
        },
        files: {
          // Dictionary of files
          "./dist/css/style.css": "src/scss/style.scss" // 'destination': 'source'
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          "src/js/<%= pkg.name %>.min.js": ["dist/js/<%= pkg.name %>.js"]
        }
      }
    },
    cssmin: {
      target: {
        src: ["dist/css/style.css"],
        dest: "dist/min/style.min.css"
      }
    },
    watch: {
      css: {
        files: ["**/*.scss"],
        tasks: ["sass", "cssmin"]
      },
      scripts: {
        files: ["src/js/*.js"],
        tasks: ["uglify"]
      }
    }
  });
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["uglify"]);
  grunt.registerTask("default", ["cssmin"]);
 grunt.registerTask("default", ["sass"]);
 grunt.registerTask("default", ["watch"]);
};

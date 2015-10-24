#!/usr/bin/env ruby

require 'fileutils'

BUILD_PATH = '.build'
PROJECT_URL = `git config --get remote.github.url`.strip
TARGET_BRANCH='gh-pages'

puts PROJECT_URL

SILENT = ($VERBOSE) ? "" : ">/dev/null 2>/dev/null"
def cmd(s, name=nil)
  puts "run: #{s}"
  system("#{s} #{SILENT}") ? puts("Success: #{name}") : abort("Failed: #{name}")
end

FileUtils.rm_r(BUILD_PATH, secure: true) if File.exist? BUILD_PATH
FileUtils.mkdir_p(BUILD_PATH)

Dir.glob("*") { |file| cmd "cp -r #{file} #{BUILD_PATH}", "CP:#{file}" }
Dir.chdir BUILD_PATH do
  cmd "git init"
  cmd "git add --all .", 'add all'
  cmd "git commit -m 'init'", 'commit'
  cmd "git push #{PROJECT_URL} master:#{TARGET_BRANCH} -f", 'push'
end

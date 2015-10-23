#!/usr/bin/env ruby

require 'fileutils'

BUILD_PATH = '.build'
TARGET_BRANCH='gh-pages'

$VERBOSE = true

SILENT = ($VERBOSE) ? "" : ">/dev/null 2>/dev/null"
def cmd(s, name=nil)
  system("#{s} #{SILENT}") ? puts("Success: #{name}") : abort("Failed: #{name}")
end

FileUtils.rm_r(BUILD_PATH, secure: true) if File.exists? BUILD_PATH
FileUtils.mkdir_p(BUILD_PATH)

Dir.glob("*") { |file| cmd "cp -r #{file} #{BUILD_PATH}", "CP:#{file}" }
Dir.chdir BUILD_PATH do
  cmd "git init"
  cmd "git add --all .", 'add all'
  cmd "git commit -m 'init'", 'commit'
  cmd "git push https://github.com/ranmocy/Coolol master:#{TARGET_BRANCH} --force"
end

#!/usr/bin/env ruby

require 'fileutils'

SOURCE = 'github'
SOURCE_BRANCH = 'shadow'
TARGET_BRANCH = 'gh-pages'

SILENT = ($VERBOSE) ? "" : ">/dev/null 2>/dev/null"
def cmd(s, name=nil)
  puts "run: #{s}"
  system("#{s} #{SILENT}") ? puts("Success: #{name}") : abort("Failed: #{name}")
end

cmd "git push #{SOURCE} #{SOURCE_BRANCH}:#{TARGET_BRANCH}", 'push'

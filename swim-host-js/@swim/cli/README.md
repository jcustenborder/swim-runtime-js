# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Command Line Tool

Command line tool for linking to Web Agent lanes over the WARP protocol.

## Installation

```sh
npm install -g swim-cli
```

## Usage

```sh
$ swim-cli help
Usage: swim-cli <command>

Commands:
  link                  stream changes to a lane of a remote node
  sync                  stream the current state and changes to a lane of a remote node
  get                   fetch the current state of a lane of a remote node
  reflect               stream introspection metadata
  help
```

```sh
$ swim-cli sync help
Usage: swim-cli sync [options] <command>

Options:
  -h, --host <hostUri>  remote host to link
  -n, --node <nodeUri>  remote node to link
  -l, --lane <laneUri>  lane to link
  -f, --format <json|recon> event output format

Commands:
  help
```

```sh
$ swim-cli reflect help
Usage: swim-cli reflect [options] <command>

Options:
  -e, --edge <edgeUri>  endpoint to introspect
  -m, --mesh <meshUri>? introspect default or specified mesh
  -p, --part <partKey>? introspect default or specified partition
  -h, --host <hostUri>? introspect default or specified host
  -n, --node <nodeUri>  introspect specified node
  -l, --lane <laneUri>  introspect specified lane
  -k, --link            introspect link behavior
  -r, --router          introspect router behavior
      --data            introspect data behavior
      --system          introspect system behavior
      --process         introspect process behavior
  -s, --stats           stream introspection statistics
  -f, --format <json|recon> event output format

Commands:
  log                   stream log events
  help
```

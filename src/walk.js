export function walk (node, callback) {
  let children
  if (Array.isArray(node)) {
    children = node
  } else {
    callback(node)
    children = node.children
  }
  if (children) {
    let child = children[0]
    let i = 0
    while (child) {
      walk(child, callback)
      child = children[++i]
    }
  }
}

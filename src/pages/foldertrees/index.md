---
title: Make your folder tree UIs faster with this One Weird Trick
date: "2017-09-07T22:12:03.284Z"
---

<sup>_operating systems HATE her!!_<sup>

Let's talk about our old friend: the folder tree. Every UI developer has built at least one of these things. Personally I've built too many for one lifetime, and most of them have been terrible.

Skeletons in my closet aside, I've learned some useful lessons about solving problems like these. I put together a simple little React example to demonstrate one of these strategies, which is fairly straightforward and all about <b>keeping your view layer as dumb as possible</b>.

Below is the UI and the code is [here](https://jsfiddle.net/leahloughran/jxc22g3e/). It's really simple, just click around on folders to expand/collapse them.

<iframe width="100%" height="300" src="//jsfiddle.net/leahloughran/jxc22g3e/embedded/result/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

In this post I'll walk through this example and some of my reasoning for why I built it the way I did. It can be applied to any tree UI, not just those built in React.

### Recursion is hard

With a nested structure like this, it’s common to use recursive logic to dig through the children. You might use recursion to render the expanded tree, find a folder by ID, or update a folder’s data in memory. These operations can be tricky and costly, so it would be nice to keep the touch-points with this complex recursive logic as tidy as possible.

Take rendering, for example. One approach would be to do the recursion straight in the `render()`. Maybe you could define a component that would render a folder and its children recursively, sorta like this:

```js
class Folder extends React.Component {
  render() {
    return (
      <div>
        <div>{this.props.folder.name}</div>
        {this.props.folder.children.map(folder =>
          <Folder folder={folder} />
        )}
      </div>
    );
  }
}
```

This totally works, and actually looks pretty nice! Personally, though, I prefer a different approach.

I mentioned the concept of <b>keeping the view layer dumb</b>. And recursion is hard. So maybe let's _not_ have our view layer do it. Let's talk about why that might be a good idea.

### Keep recursive logic separate from the view layer

Whenever possible, it’s nice to avoid having complicated logic tied up directly in rendering. In the example above, the recursive logic is simple, but in a real world application it could grow in complexity fast. If you need to reuse the folder tree or present it in a slightly different way, you’re forced to either use the existing component (maybe going in and adding some options in that component to support different UI needs, which could turn unwieldy) or create a new component, in which case you’d have to rewrite the recursive logic to deal with the nested structure.

Also, by recursing through the entire tree every time `render()` is invoked, you could be making it harder to keep performance in check. Is it ever possible you’d want to re-render without recursing through the whole tree? Perhaps, but it’s hard to explore those options when they’re so tied up in each other.

Disclaimer: it's important to be wary of premature optimization here. But keeping the recursion totally separate from the render eliminates this problem altogether and gives you more control over when and how often the most complicated logic is being executed.

So how can we keep these concerns separated? One way is to flatten the tree contents and pass that data set to the view layer, so your `render()` doesn't have to understand anything about the nested structure.

### Flatten the tree to prepare for rendering

We keep a copy of the nested data structure, or the "true" tree, and then build a parallel flattened array to represent the rendered tree nodes. By preparing this render-ready flat array, rendering our folders all the way down could be as simple as a basic map.

```js
{flattenedFolders.map(folder => (
  <div>{folder.name}</div>
)}
```

Let's think about how we might go about calculating this flattened array.

We want to recurse through the entire tree and create a flat array of folders. For each folder, we should calculate two extra pieces of data that will come in handy for rendering and later manipulating our original tree. Those two pieces of data are:

#### 1. Indent level

We want our tree to have the appearance of nesting, even though our render data is just a flat array. We'll do this by storing `indentLevel` which will make sure child nodes are placed at a "deeper" indent than their parents.

#### 2. Path to folder

Keeping track of the path to the node in the nested or “true” data structure makes lookup quick and easy later on. We can use lodash's [`get`](https://lodash.com/docs/4.17.10#get) with the path to immediately retrieve the node from the original data structure.

Here's some data representing a nested tree:

```js
[
  {name: "Documents", children: [
    {name: "2015", children: [
      {name: "Work", children: [
        {name: "Client X"},
          {name: "Client Y"},
          {name: "Client Z"},
        ]},
      {name: "School"},
      {name: "Personal"},
    ]},
  ]},
]
```

The resulting "flattened" data should look like this:

```js
[
  {name: "Documents", indentLevel: 0, path: "0"},
  {name: "2015", indentLevel: 1, path: "0.children.0"},
  {name: "Work", indentLevel: 2, path: "0.children.0.children.0"},
  {name: "Client X", indentLevel: 3, path: "0.children.0.children.0.children.0"},
  {name: "Client Y", indentLevel: 3, path: "0.children.0.children.0.children.1"},
  {name: "Client Z", indentLevel: 3, path: "0.children.0.children.0.children.2"},
  {name: "School", indentLevel: 2, path: "0.children.0.children.1"},
  {name: "Personal", indentLevel: 2, path: "0.children.0.children.2"},
]
```

Finally, here's the logic in our example that does this calculation of the flattened tree:

```js
function flattenFolders(folders, indentLevel=0, parentPath=null) {
  return folders.reduce((flattenedFolders, folder, index) => {
    // This will omit the children from folderData
    const { children, ...folderData } = folder;
    // Calculate the path to this folder in the nested structure so we can use it for quick searching and updating later
    const path = parentPath === null ? `${index}` : `${parentPath}.children.${index}`;
    return [
      // The folders we have flattened so far
      ...flattenedFolders,
      // The relevant data for this current folder, including the indentLevel and path we calculated
      {...folderData, indentLevel, path},
      // The child folders, recursively
      ...(folder.expanded && children ? flattenFolders(children, indentLevel+1, path) : []),
    ];
  }, []);
}
```

This flattened data is super easy to render and easy to work with to make manipulations to our original data structure.

Okay, now that we have our flattened structure, how do we render it?

### Rendering with the appearance of nesting

To render the tree with the appearance of nesting, we map through the array and render each node with a left margin or left padding based on the `indentLevel`.

```js
folders.map(folder => {
  const margin = folder.indentLevel * 20;
  return (
    <div style={{marginLeft: margin}} onClick={this.toggleFolder.bind(this, folder)}>
      <i className="material-icons">{folder.expanded ? "folder_open" : "folder"}</i>
      {folder.name}
    </div>
  )
})
```

### Using the path to reference nodes in the original data structure

To manipulate a folder's data, we use its `path` to reference the node in the "true" tree and make our changes. Then, if we need to, we can recalculate our "flattened" tree.

Here's the function to open or close a folder from our example.

```js
toggleFolder = folder => {
  const newFolders = _.cloneDeep(this.state.folders);
  // Since we calculated the path to the folder in flattenFolders, it's easy to find in the nested data structure
  const folderToToggle = _.get(newFolders, folder.path);
  folderToToggle.expanded = !folderToToggle.expanded;
  this.setState({
    folders: newFolders,
    flattenedFolders: flattenFolders(newFolders), // When we update the folders data, we must re-calculate the flattened folders
  });
}
```

### That's all!

Pulling out the recursion into a separate, pure function to create a flat, dumb structure is awesome because it decouples one of the most expensive parts of our program (recursing through the tree) from one of the most important and frequent (rendering). It will help us keep things speedy even as our UI gains more and more complex features. It means our view layer doesn't have to be quite as smart. It simplifies testing. It makes it easier to create different UIs to present the data in different ways.

Check out the [code](https://jsfiddle.net/leahloughran/jxc22g3e/)! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧


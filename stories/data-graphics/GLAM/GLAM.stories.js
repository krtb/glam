import { storiesOf } from "@storybook/svelte";

import GenericQuantileView from "./GenericQuantileView.svelte";
import GenericProportionView from "./GenericProportionView.svelte";
import Test from "./Test.svelte";
import "../../../public/static/global.css";
import "./shared.css";

storiesOf("Data Graphics|GLAM", module)
  .add("Quantile Explorer (numeric hists, scalar aggregations)", () => ({
    Component: GenericQuantileView
  }))
  .add("Proportion Explorer (categorical data)", () => ({
    Component: GenericProportionView
  }))
  .add("TEST", () => ({
    Component: Test
  }));

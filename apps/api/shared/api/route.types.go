package api

import "github.com/kinsittr/kinsittr-api/typings"

type RouteMethod string

type RouterSchema struct {
	RouteMethod RouteMethod
	Path        string
	Middlewares []typings.FiberMiddleware
	Handler     typings.FiberMiddleware
}

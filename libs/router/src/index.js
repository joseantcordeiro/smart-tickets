import {A, setLinkProps} from './lib/Link';
import useRedirect from './lib/redirect';
import {useQueryParams, setQueryParams, getQueryParams} from "./lib/queryParams";
import {useInterceptor} from './lib/interceptor';
import {useControlledInterceptor} from './lib/controlledInterceptor';
import {useTitle, getTitle} from './lib/title';
import {
	navigate,
	useRoutes,
	setPath,
	getPath,
	getWorkingPath,
	setBasepath,
	getBasepath,
	usePath,
} from './lib/router';

export {
	A,
	setLinkProps,
	useRedirect,
	useTitle,
	getTitle,
	useQueryParams,
	useInterceptor,
	useControlledInterceptor,
	navigate,
	useRoutes,
	setPath,
	getPath,
	getWorkingPath,
	setQueryParams,
	getQueryParams,
	setBasepath,
	getBasepath,
	usePath
};
